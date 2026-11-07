"""Browser smoke tests for the V1.6 synthetic UI. Does not test real OAuth or deliveries."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'standalone.html').read_text('utf-8')
MOCK_STORAGE="""Object.defineProperty(window,'localStorage',{configurable:true,value:(()=>{const store={};return{getItem(k){return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]},clear(){for(const k in store)delete store[k]}}})()})"""

def setup(page):
    page.evaluate(MOCK_STORAGE)
    page.set_content(HTML,wait_until='domcontentloaded')
    page.wait_for_timeout(350)

def verify(page,loc):
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    setup(page)
    assert page.evaluate('neurotraceDemo.state.loggedIn') is True
    assert page.locator('#game-screen').count()==1
    assert page.locator('.nav-item').count()==3
    t=page.evaluate('''NeuroTrace3D.TASKS.map((t,i)=>({id:t.id,terminals:t.boundaryTerminals.length}))''')
    assert len(t)==8 and all(v['terminals']>=3 for v in t)
    assert page.evaluate('NeuroTrace3D.connectionExists(0,[],"a:start","a:end")')=='boundary'
    assert page.evaluate('NeuroTrace3D.connectionExists(0,[],"a:end","a:start")')=='boundary'
    # Clicking boundary terminal can inspect, but cannot count as connectable node
    obj=page.evaluate('''(()=>{const v=window.__neural3dViewer,p=v.projectedEndpoints()['a:start'];return {p,selected:v.pick(p.x,p.y)}})()''')
    assert obj['selected']['type']=='node',obj
    canvas=page.locator('.nerve-canvas')
    canvas.click(position={'x':obj['p']['x'],'y':obj['p']['y']},force=True)
    assert page.evaluate('neurotraceDemo.state.selectedBoundaryEndpointId')=='a:start'
    assert page.evaluate('neurotraceDemo.state.selectedNodes.length')==0
    assert page.locator('#connect').is_disabled()
    page.locator('#endpoints').click()
    assert page.evaluate('neurotraceDemo.state.endpointsVisible')==True
    assert page.evaluate('neurotraceDemo.state.selectedNodes.length')==0
    # Touch dragging down decreases pitch; previous version increased and clamped
    initial=page.evaluate('window.__neural3dViewer.camera.pitch')
    box=canvas.bounding_box()
    sx=box['x']+box['width']*.49;sy=box['y']+box['height']*.5
    page.mouse.move(sx,sy);page.mouse.down();page.mouse.move(sx,sy+125,steps=9);page.mouse.up()
    assert page.evaluate('window.__neural3dViewer.camera.pitch')<initial-.30
    page.evaluate('window.__neural3dViewer.camera.pitch=3.12')
    page.mouse.move(sx,sy);page.mouse.down();page.mouse.move(sx,sy-45,steps=5);page.mouse.up()
    after=page.evaluate('window.__neural3dViewer.camera.pitch')
    assert -3.141593<after<3.141593
    # Shop category, product details and local point transaction
    page.locator('[data-page="gift"]').first.click()
    assert page.locator('.shop-card').count()==4
    page.screenshot(path=str(ROOT/f'screenshot-shop-{loc}.png'))
    page.locator('[data-shop-filter="gear"]').click()
    assert page.locator('.shop-card').count()==1
    page.locator('[data-shop-filter="all"]').click()
    page.locator('[data-shop-preview="wasabi55"]').click()
    assert page.locator('.shop-modal').count()==1
    before=page.evaluate('neurotraceDemo.state.score')
    page.locator('[data-shop-redeem="wasabi55"]').click()
    assert page.evaluate('neurotraceDemo.state.score')==before-60
    assert page.evaluate('neurotraceDemo.state.shopOrders.length')==1
    assert page.locator('.shop-order').count()==1
    # Local mock storage survives reloading self-contained markup in a page
    saved=page.evaluate('localStorage.getItem("neurotrace-demo-shop-v16")')
    assert 'wasabi55' in saved
    # Secondary navigation back, settings, logout
    page.locator('#go-back').click()
    page.locator('[data-page="settings"]').first.click()
    page.locator('#logout-demo').click()
    assert page.locator('#login-demo').count()==1
    assert page.evaluate('neurotraceDemo.state.loggedIn')==False
    page.screenshot(path=str(ROOT/f'screenshot-login-{loc}.png'))
    assert 'false' in page.evaluate('localStorage.getItem("neurotrace-demo-auth-v16")')
    page.locator('[data-oauth="qq"]').click()
    assert page.locator('#login-demo').count()==1
    page.locator('#login-demo').click()
    assert page.evaluate('neurotraceDemo.state.loggedIn') is True
    assert page.evaluate('neurotraceDemo.state.page')=='game'
    assert page.evaluate('neurotraceDemo.state.shopOrders.length')==1
    page.screenshot(path=str(ROOT/f'screenshot-game-{loc}.png'))
    assert not errors, errors
    print(loc,'PASS: 8 tasks, boundary, camera, 4 products, redemption, logout/login, pending OAuth, stable state')

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
    for name,viewport in [('desktop',{'width':1380,'height':900}),('mobile',{'width':390,'height':844})]:
        context=browser.new_context(viewport=viewport,device_scale_factor=1)
        pg=context.new_page();verify(pg,name);context.close()
    browser.close()
