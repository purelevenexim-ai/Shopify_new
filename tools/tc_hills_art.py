import math, random, sys
random.seed(11)
W,H=1200,900
def pts(f, x0=-30, x1=1230, step=10): return [(x, f(x)) for x in range(x0, x1+1, step)]
def poly(points): return 'M'+' L'.join(f'{x:.0f} {y:.0f}' for x,y in points)
def area(f, step=10): p=pts(f,step=step); return poly(p)+f' L1230 {H+20} L-30 {H+20} Z'
g=lambda x,c,w: math.exp(-((x-c)/w)**2)
yA=lambda x: 400-185*g(x,790,70)-120*g(x,700,95)-70*g(x,905,60)-80*g(x,330,120)-45*g(x,520,80)+7*math.sin(x/37)+5*math.sin(x/13)
yA2=lambda x: 430-60*g(x,150,150)-70*g(x,1080,120)-30*g(x,600,140)+6*math.sin(x/50+2)
yB=lambda x: 490-55*g(x,240,170)-42*g(x,1010,150)-22*g(x,640,110)+7*math.sin(x/70+1)
yC=lambda x: 572-40*g(x,330,240)+20*g(x,820,200)-32*g(x,1120,170)+6*math.sin(x/90)
yD=lambda x: 700-24*math.sin(x/190+0.6)+9*math.sin(x/63+1.3)
o=[].append; out=o.__self__
o(f'<svg class="tc-hills-art" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: women plucking tea on the misty hills of Munnar" preserveAspectRatio="xMidYMid slice">')
o('<defs>')
o('<linearGradient id="tha-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE3DD"/><stop offset=".5" stop-color="#EDF1E6"/><stop offset="1" stop-color="#FBF5E8"/></linearGradient>')
o('<linearGradient id="tha-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF7" stop-opacity="0"/><stop offset=".5" stop-color="#FFFDF7" stop-opacity=".75"/><stop offset="1" stop-color="#FFFDF7" stop-opacity="0"/></linearGradient>')
o('<linearGradient id="tha-peak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B9CEC6"/><stop offset=".62" stop-color="#A9C1B8"/><stop offset=".7" stop-color="#97B2A8"/><stop offset="1" stop-color="#9DB7AD"/></linearGradient>')
o('<radialGradient id="tha-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FBE6AE"/><stop offset=".5" stop-color="#F8E3B2" stop-opacity=".5"/><stop offset="1" stop-color="#F8E3B2" stop-opacity="0"/></radialGradient>')
o(f'<clipPath id="tha-clipC"><path d="{area(yC)}"/></clipPath>')
o(f'<clipPath id="tha-clipD"><path d="{area(yD)}"/></clipPath>')
o('<g id="tha-picker">'
  '<path d="M-30 -66 L-7 -69 L-9 -26 L-32 -28 Z" fill="#B07C44"/>'
  '<path d="M-31 -56 L-8 -59 M-31.5 -46 L-8.5 -48.5 M-32 -36 L-9 -38" stroke="#8B5C2E" stroke-width="2.2" fill="none"/>'
  '<path d="M-30 -66 L-7 -69" stroke="#8B5C2E" stroke-width="3"/>'
  '<path d="M-19 -68 Q-10 -90 1 -85" stroke="#6E4825" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  '<path d="M-9 -67 C1 -72 10 -68 12 -58 L17 -20 C17 -8 10 2 0 2 L-15 2 C-20 -10 -18 -31 -16 -45 C-15 -57 -13 -64 -9 -67 Z" fill="currentColor"/>'
  '<path d="M-7 -67 C4 -61 11 -48 15 -27 L8 -27 C4 -43 -1 -53 -9 -61 Z" fill="#fff" fill-opacity=".3"/>'
  '<path d="M-14 -20 L15 -20" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>'
  '<path d="M6 -58 C18 -54 27 -45 34 -35" stroke="#7E4F31" stroke-width="5.5" fill="none" stroke-linecap="round"/>'
  '<circle cx="35" cy="-34" r="3.6" fill="#7E4F31"/>'
  '<circle cx="2" cy="-78" r="9" fill="#7E4F31"/>'
  '<circle cx="-7.5" cy="-79" r="5.6" fill="#21160F"/>'
  '<path d="M-6.5 -80 C-5 -89 9 -91 11.5 -81 C6 -85 -1 -85 -6.5 -80 Z" fill="#21160F"/>'
  '</g>')
o('</defs>')
o(f'<rect width="{W}" height="{H}" fill="url(#tha-sky)"/>')
o('<circle cx="960" cy="185" r="160" fill="url(#tha-sun)"/><circle cx="960" cy="185" r="44" fill="#FBEBC3"/>')
for cx,cy,s in [(200,150,1),(540,98,.75),(1110,130,.65)]:
    o(f'<g fill="#FFFFFF" fill-opacity=".85" transform="translate({cx} {cy}) scale({s})"><ellipse cx="0" cy="2" rx="78" ry="18"/><ellipse cx="-32" cy="-10" rx="34" ry="22"/><ellipse cx="16" cy="-18" rx="42" ry="30"/></g>')
for bx,by,s in [(600,250,1),(628,236,.8),(652,255,.9)]:
    o(f'<path d="M{bx} {by} q{7*s:.0f} {-7*s:.0f} {14*s:.0f} 0 q{7*s:.0f} {-7*s:.0f} {14*s:.0f} 0" stroke="#5F716B" stroke-width="2.4" fill="none" stroke-linecap="round"/>')
o(f'<path d="{area(yA2)}" fill="#C3D5CE"/>')
o(f'<path d="{area(yA, step=6)}" fill="url(#tha-peak)"/>')
o('<rect x="0" y="395" width="1200" height="130" fill="url(#tha-mist)"/>')
o(f'<path d="{area(yB)}" fill="#8FB1A0"/>')
def oak(tx, ty, h, col="#5B8A6C"):
    o(f'<path d="M{tx} {ty} L{tx+2} {ty-h}" stroke="#5E7F6C" stroke-width="2.2"/>')
    for k in range(5):
        side=-1 if k%2 else 1
        o(f'<ellipse cx="{tx+side*4}" cy="{ty-h+6+k*h/6:.0f}" rx="{7-k*0.6:.1f}" ry="5.5" fill="{col}"/>')
for tx in [612,640,688,995,1040,1160,150,96]:
    oak(tx, yB(tx)+4, random.randint(70,96))
o('<rect x="0" y="500" width="1200" height="90" fill="url(#tha-mist)" opacity=".75"/>')
# hill C: continuous rounded hedges
o(f'<path d="{area(yC)}" fill="#4C7A44"/>')
o('<g clip-path="url(#tha-clipC)" stroke-linecap="round" fill="none">')
for i in range(0,16):
    off=i*21+10
    o(f'<path d="{poly(pts(lambda x,off=off: yC(x)+off))}" stroke="#78A967" stroke-width="15"/>')
    o(f'<path d="{poly(pts(lambda x,off=off: yC(x)+off-4))}" stroke="#93C281" stroke-width="5" stroke-dasharray="0 11"/>')
o('</g>')
o(f'<path d="{poly(pts(lambda x: yC(x)+1))}" stroke="#86B774" stroke-width="5" fill="none" stroke-linecap="round"/>')
def jacaranda(x, s, seed):
    r=random.Random(seed); base=yC(x)+12
    o(f'<g stroke="#4E3B2E" stroke-linecap="round" fill="none"><path d="M{x} {base} C {x-3} {base-40*s:.0f}, {x+5} {base-75*s:.0f}, {x-2} {base-105*s:.0f}" stroke-width="{8*s:.1f}"/>'
      f'<path d="M{x} {base-62*s:.0f} C {x+22*s:.0f} {base-82*s:.0f}, {x+48*s:.0f} {base-92*s:.0f}, {x+70*s:.0f} {base-110*s:.0f}" stroke-width="{4.5*s:.1f}"/>'
      f'<path d="M{x} {base-76*s:.0f} C {x-24*s:.0f} {base-92*s:.0f}, {x-50*s:.0f} {base-100*s:.0f}, {x-72*s:.0f} {base-114*s:.0f}" stroke-width="{4.5*s:.1f}"/></g>')
    cols=['#6F51A8','#8467BE','#9C80D4','#B79EE6','#D0BEF2']
    for layer,col in enumerate(cols):
        n=[26,24,20,14,9][layer]
        for k in range(n):
            ang=r.uniform(0,math.pi); rad=r.uniform(0.15,1)
            cx=x+math.cos(ang)*95*s*rad*r.choice([1,-1]); cy=base-118*s-math.sin(ang)*30*s*rad - layer*5*s + r.uniform(-6,10)*s
            rr=r.uniform(8,15)*s*(1-layer*0.1)
            o(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{rr:.1f}" fill="{col}"/>')
    for k in range(18):
        o(f'<circle cx="{x+r.uniform(-100,100)*s:.0f}" cy="{base+r.uniform(2,30):.0f}" r="{r.uniform(1.5,2.8):.1f}" fill="#B49AE4"/>')
jacaranda(285,1.2,3); jacaranda(470,0.95,21)
for px,col,flip in [(585,'#B8245E',False),(700,'#E08A23',False),(840,'#23807C',True)]:
    py=yD(px)+28; sx=-1.75 if flip else 1.75
    o(f'<use href="#tha-picker" transform="translate({px} {py:.0f}) scale({sx} 1.75)" style="color:{col}"/>')
o(f'<path d="{area(yD)}" fill="#355F31"/>')
o('<g stroke-linecap="round" fill="none">')
o(f'<path d="{poly(pts(lambda x: yD(x)+6))}" stroke="#5B9350" stroke-width="30"/>')
o(f'<path d="{poly(pts(lambda x: yD(x)-3))}" stroke="#7CB16B" stroke-width="10" stroke-dasharray="0 18"/>')
o('</g>')
o('<g clip-path="url(#tha-clipD)" stroke-linecap="round" fill="none">')
for i in range(1,7):
    off=i*38+6
    o(f'<path d="{poly(pts(lambda x,off=off: yD(x)+off))}" stroke="#558C4A" stroke-width="28"/>')
    o(f'<path d="{poly(pts(lambda x,off=off: yD(x)+off-8))}" stroke="#76AD66" stroke-width="8" stroke-dasharray="0 18"/>')
o('</g>')
def sprig(x,y,rot,s):
    o(f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">'
      '<path d="M0 0 C 6 -60, 4 -120, 14 -190" stroke="#2F5E2D" stroke-width="5" fill="none" stroke-linecap="round"/>'
      '<path d="M10 -120 C 50 -150, 105 -140, 128 -100 C 90 -88, 40 -92, 10 -120 Z" fill="#3D7A39"/><path d="M14 -119 C 55 -125, 95 -112, 124 -101" stroke="#76B067" stroke-width="2.5" fill="none"/>'
      '<path d="M8 -70 C -32 -98, -88 -92, -112 -52 C -74 -40, -26 -44, 8 -70 Z" fill="#336D31"/><path d="M4 -70 C -38 -74, -78 -62, -108 -53" stroke="#6FA862" stroke-width="2.5" fill="none"/>'
      '<path d="M14 -190 C 4 -214, 10 -240, 26 -256 C 34 -232, 30 -208, 14 -190 Z" fill="#5E9C50"/>'
      '</g>')
sprig(70,935,8,1.05); sprig(1140,940,-10,0.95)
o('</svg>')
sys.stdout.write('\n'.join(out))
