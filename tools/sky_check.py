"""Recalculate the Shenzhen-to-Wuhan bearing and Shenzhen's western sky.

Standard-library cross-check. Coordinates are in degrees (east and north positive).
Uses geometric heights, J2000-to-date precession and mean sidereal time. Output
is rounded to 0.1 degrees for a UI, not intended for telescope pointing.
"""
from datetime import datetime, timedelta, timezone
from math import asin, atan, atan2, cos, degrees, hypot, radians, sin, tan

SHENZHEN = (22.5431, 114.0579)
WUHAN = (30.5928, 114.3055)
TAURUS = {
    '毕宿五 α Tau': (68.9802, 16.5093),
    '五车五 β Tau': (81.5730, 28.6075),
    '天关 ζ Tau': (84.4112, 21.1425),
    '尾部参考点 1': (51.2033, 9.0289),
    '尾部参考点 2': (54.2183, 0.4017),
}

def route(start=SHENZHEN, end=WUHAN):
    """Vincenty inverse on WGS84 for this pair of non-antipodal city points."""
    semimajor, flattening = 6378137, 1/298.257223563
    semiminor = semimajor * (1 - flattening)
    u, v = [atan((1-flattening)*tan(radians(lat))) for lat in (start[0], end[0])]
    delta = radians(end[1] - start[1])
    lam = delta
    for _ in range(80):
        ss = hypot(cos(v)*sin(lam), cos(u)*sin(v)-sin(u)*cos(v)*cos(lam))
        cs = sin(u)*sin(v)+cos(u)*cos(v)*cos(lam)
        sigma = atan2(ss, cs)
        sa = cos(u)*cos(v)*sin(lam)/ss
        ca2 = 1-sa*sa
        c2 = cs-2*sin(u)*sin(v)/ca2
        C = flattening/16*ca2*(4+flattening*(4-3*ca2))
        new_lam = delta+(1-C)*flattening*sa*(sigma+C*ss*(c2+C*cs*(-1+2*c2*c2)))
        if abs(new_lam-lam)<1e-12:
            break
        lam = new_lam
    u2 = ca2*(semimajor**2-semiminor**2)/semiminor**2
    A = 1+u2/16384*(4096+u2*(-768+u2*(320-175*u2)))
    B = u2/1024*(256+u2*(-128+u2*(74-47*u2)))
    correction = B*ss*(c2+B/4*(cs*(-1+2*c2*c2)-B/6*c2*(-3+4*ss*ss)*(-3+4*c2*c2)))
    bearing = degrees(atan2(cos(v)*sin(lam), cos(u)*sin(v)-sin(u)*cos(v)*cos(lam)))%360
    return bearing, semiminor*A*(sigma-correction)/1000

def horizontal(ra_deg, dec_deg, local_time, location=SHENZHEN):
    jd=local_time.timestamp()/86400+2440587.5
    T=(jd-2451545.0)/36525
    def arcsec(x):
        return radians(x/3600)
    zeta=arcsec(2306.2181*T+0.30188*T*T+0.017998*T**3)
    z=arcsec(2306.2181*T+1.09468*T*T+0.018203*T**3)
    theta=arcsec(2004.3109*T-0.42665*T*T-0.041833*T**3)
    ra, dec=map(radians,(ra_deg,dec_deg))
    a=cos(dec)*sin(ra+zeta)
    b=cos(theta)*cos(dec)*cos(ra+zeta)-sin(theta)*sin(dec)
    c=sin(theta)*cos(dec)*cos(ra+zeta)+cos(theta)*sin(dec)
    ra_date,dec_date=atan2(a,b)+z,asin(c)
    gmst=280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T**3/38710000
    phi,lon=location
    h=radians((gmst+lon)%360)-ra_date
    phi=radians(phi)
    east=-cos(dec_date)*sin(h)
    north=sin(dec_date)*cos(phi)-cos(dec_date)*cos(h)*sin(phi)
    up=sin(dec_date)*sin(phi)+cos(dec_date)*cos(h)*cos(phi)
    return degrees(atan2(east,north))%360,degrees(asin(up))

if __name__=='__main__':
    bearing,km=route()
    print(f'Shenzhen -> Wuhan: {bearing:.2f} deg, {km:.1f} km')
    for h,m in [(19,30),(19,40),(19,45),(20,0),(20,30)]:
        t=datetime(2026,4,23,h,m,tzinfo=timezone(timedelta(hours=8)))
        print(t.isoformat())
        for name,rd in TAURUS.items():
            az,alt=horizontal(*rd,t)
            print(f'  {name:17} az {az:5.1f}  alt {alt:5.1f}')
