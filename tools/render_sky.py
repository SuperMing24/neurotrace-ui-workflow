"""Render the two photographic horizon views. Supply the original ESO/Fujii files
listed in docs/TAURUS_SKY.html as allsky.jpg, taurus.jpg and pleiades.jpg.
Run: python tools/render_sky.py PHOTO_DIR OUTPUT_DIR [--study]
Use --study to render only the expanded V2.3 field.
"""
import sys
from pathlib import Path
from datetime import datetime,timedelta,timezone
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import map_coordinates
from sky_check import horizontal, route

photo=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(exist_ok=True)
time=datetime(2026,4,23,19,40,tzinfo=timezone(timedelta(hours=8)))
lines=[[[84.4112,21.1425],[68.9802,16.5093],[67.1656,15.8709],[64.9483,15.6276],[65.7337,17.5425],[67.1542,19.1804],[81.573,28.6075]],[[64.9483,15.6276],[60.1701,12.4903],[51.7923,9.7327],[60.7891,5.9893]],[[51.7923,9.7327],[51.2033,9.0289],[54.2183,0.4017]]]
def enu(az,alt):
    a,b=np.radians([az,alt]);return np.stack([np.cos(b)*np.sin(a),np.cos(b)*np.cos(a),np.sin(b)],axis=-1)
def eq(ra,dec):
    a,b=np.radians([ra,dec]);return np.stack([np.cos(a)*np.cos(b),np.sin(a)*np.cos(b),np.sin(b)],axis=-1)
def basis(az,alt):
    return enu(az,alt),enu(az+90,0),-enu(az,alt+90)
def plate(ra,dec,pa):
    c=eq(ra,dec);e=eq(ra+90,0);n=np.cross(c,e);a=np.radians(pa)
    return c,-np.cos(a)*e+np.sin(a)*n,-np.sin(a)*e-np.cos(a)*n
def sample(im,x,y,wrap=False):
    # Wrap only longitude on the spherical background.
    if wrap:
        x=np.mod(x,im.shape[1])
    xx=x.clip(0,im.shape[1]-1);yy=y.clip(0,im.shape[0]-1)
    return np.stack([map_coordinates(im[...,k],(yy,xx),order=1,mode='nearest') for k in range(3)],-1).astype(float)
def mask(x,y,im,f):
    m=np.clip(np.minimum.reduce([x,y,im.shape[1]-1-x,im.shape[0]-1-y])/f,0,1)
    return (m*m*(3-2*m))[...,None]
rotation=np.array([enu(*horizontal(a,b,time)) for a,b in [(0,0),(90,0),(0,90)]])
# Turn the former locally fitted galactic long/lat pixel calibration into an
# orthonormal rotation for the whole ESO sphere. The three high-resolution
# plates retain their individual calibrations.
G=np.array([[-.0548755604,-.8734370902,-.4838350155],[.4941094279,-.4448296300,.7469822445],[-.867666149,-.1980763734,.4559837762]])
K=np.array([[1.0035629154406078,.0205110724891103],[-.0226466787087384,.9987194038304664]])
def gal_vec(x,y):return eq(180-x*360/6000,90-y*180/3000)
x0,y0=np.meshgrid(np.arange(-400.,401.,100),np.arange(1400.,2001.,100));xy=np.c_[x0.ravel(),y0.ravel()]
imxy=(xy-[0,1800])@K+[45.5658792801292,1825.7592989109642]
A=gal_vec(*xy.T);B=gal_vec(*imxy.T);u,_,vt=np.linalg.svd(A.T@B);galrot=G.T@(u@vt)
allsky=np.asarray(Image.open(photo/'allsky.jpg').convert('RGB'))
fuji=np.asarray(Image.open(photo/'taurus.jpg').convert('RGB').resize((1223,746),Image.Resampling.LANCZOS))
bardon=np.asarray(Image.open(photo/'pleiades.jpg').convert('RGB'))
assert allsky.shape[:2]==(3000,6000) and fuji.shape[:2]==(746,1223) and bardon.shape[:2]==(822,1280)
fix=np.array([-1458.865523,-783.521306,587.404286,785.509644,-1467.569187,381.134199,.007931018,-.001890101,-3.938504537])
M=np.r_[fix[:8],1].reshape(3,3)
c=eq(68,20);e=eq(158,0);n=np.cross(c,e)
c2,x2,y2=plate(15*(3+52/60+58.37/3600),30+24/60+54.38/3600,-75.3)
fp=640/np.tan(np.radians(1320.26/120))
def render(name,az,alt,f,stereo,cy,study=False):
    w,h=(800,1565) if study else (840,1800)
    C,X,Y=basis(az,alt);cx=840*(.64 if stereo else .50)
    # Use the V2.2 tangent plane, including its 5-degree roll, to preserve an
    # exact 4:5 linear scale across the entire field when displayed at equal size.
    croll,sroll=np.cos(np.radians(-5)),np.sin(np.radians(-5))
    pixel_anchor=np.array([385.,1057.])
    study_anchor=np.array([.47*w,.75*h])
    minimum_alt=90.
    image=np.zeros((h,w,3),dtype='uint8')
    for y0 in range(0,h,144):
        iy,ix=np.mgrid[y0:min(h,y0+144),:w]
        if study:
            dx,dy=ix-study_anchor[0],iy-study_anchor[1]
            px=pixel_anchor[0]+croll*dx-sroll*dy
            py=pixel_anchor[1]+sroll*dx+croll*dy
        else:
            px,py=ix,iy
        x=(px-cx)/f;y=(py-cy)/f
        if stereo:
            q=(x*x+y*y)/4
            vv=((1-q)[...,None]*C+x[...,None]*X+y[...,None]*Y)/(1+q)[...,None]
        else:
            vv=C+x[...,None]*X+y[...,None]*Y;vv/=np.linalg.norm(vv,axis=-1,keepdims=True)
        v=vv@rotation.T;gu=v@galrot
        lng=np.degrees(np.arctan2(gu[...,1],gu[...,0]));lat=np.degrees(np.arcsin(gu[...,2].clip(-1,1)))
        wide=sample(allsky,(180-lng)*6000/360,(90-lat)*3000/180,True)
        den=v@c
        xy=np.stack([(v@e)/np.maximum(.01,den),(v@n)/np.maximum(.01,den),np.ones_like(x)],-1)@M.T
        xy=xy[...,:2]/np.maximum(.01,xy[...,2:3]);r=(xy-[611.5,373])/700
        xy+=r*(r*r).sum(-1,keepdims=True)*fix[8]
        xx,yy=np.moveaxis(xy,-1,0);alpha=.80*mask(xx,yy,fuji,155)*(den>.7)[...,None]
        signal=.82*np.maximum(wide-5,0)**.95
        signal=(1-alpha)*signal+alpha*.76*sample(fuji,xx,yy)**.99
        d=v@c2;xx=(v@x2)/np.maximum(.01,d)*fp+640;yy=(v@y2)/np.maximum(.01,d)*fp+411
        alpha=.82*mask(xx,yy,bardon,190)*(d>.8)[...,None]
        signal=(1-alpha)*signal+alpha*.75*np.maximum(0,sample(bardon,xx,yy)-10)**.995
        color=np.array([8,17,28])+signal*np.array([1,1.04,1.11])
        altitude=np.degrees(np.arcsin(vv[...,2].clip(-1,1)))
        minimum_alt=min(minimum_alt,float(altitude.min()))
        # The opaque terrestrial hemisphere is schematic. Never project stars below the horizon.
        glow=np.exp(-(altitude/7)**2)[...,None]
        sky=color+glow*np.array([9,6,4]);ground=np.array([5,13,21])+glow*np.array([13,12,10])
        image[iy[:,0],:]=np.where((altitude>=0)[...,None],sky,ground).clip(0,192).astype('uint8')
    def project(rd):
        vec=eq(*np.array(rd).T)@rotation
        den=1+vec@C if stereo else vec@C
        k=(2*f if stereo else f)/den
        xy=np.stack([cx+k*(vec@X),cy+k*(vec@Y)],-1)
        if study:
            dx,dy=(xy-pixel_anchor).T
            xy=study_anchor+np.stack([croll*dx+sroll*dy,-sroll*dx+croll*dy],-1)
        return xy
    im=Image.fromarray(image).convert('RGBA')
    over=Image.new('RGBA',(w*2,h*2));dr=ImageDraw.Draw(over)
    for i,path in enumerate(lines):
        points=project(path)
        alpha=(169 if study else 194) if i==0 else (170 if study else 195)
        width=(7 if study else 6) if i==0 else (6 if study else 5)
        ink=(201,178,141,alpha) if i==0 else (180,162,134,alpha)
        dr.line(list(map(tuple,points*2)),fill=ink,width=width,joint='curve')
        for j,(px,py) in enumerate(points*2):
            r=5 if i==0 and j in [0,1,6] else 4.0
            dr.ellipse((px-r,py-r,px+r,py+r),fill=(232,193,137,235) if i==0 and j==1 else (208,215,214,221))
    im=Image.alpha_composite(im,over.resize((w,h),Image.Resampling.LANCZOS)).convert('RGB')
    if study and minimum_alt<=0:
        raise ValueError('The study frame crosses the terrestrial horizon')
    im.save(out/('sky23-focus.webp' if study else 'sky20-'+name+'.webp'),quality=94 if study else 90,method=5)
    print(name,'minimum field altitude',round(minimum_alt,2))
    print(name,'Aldebaran pixel',project([lines[0][1]]).round(1).tolist(),'min star altitude',min(horizontal(*p,time)[1] for line in lines for p in line))
# Off-axis position of the optical centre is a crop, and preserves the sky roll.
if '--study' in sys.argv[3:]:
    render('study',281.4,33,920,False,899,study=True)
else:
    render('hubei',route()[0],35,245,True,1120)
    render('taurus',281.4,33,920,False,899)
