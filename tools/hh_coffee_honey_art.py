# Coffee estate and honey hills scenes, same language as tc_hills_art.py / hh_spice_art.py.
# usage: python3 hh_coffee_honey_art.py coffee|honey
import math, random, sys
W,H=1200,900
def pts(f, x0=-30, x1=1230, step=10): return [(x, f(x)) for x in range(x0, x1+1, step)]
def poly(points): return 'M'+' L'.join(f'{x:.0f} {y:.0f}' for x,y in points)
def area(f, step=10): p=pts(f,step=step); return poly(p)+f' L1230 {H+20} L-30 {H+20} Z'
g=lambda x,c,w: math.exp(-((x-c)/w)**2)
kind=sys.argv[1]
out=[]; o=out.append
label={'coffee':'Illustration: picking coffee cherries under silver oaks','honey':'Illustration: bee boxes among wildflowers in the Idukki hills'}[kind]
o(f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{label}" preserveAspectRatio="xMidYMid slice">')
o('<defs><linearGradient id="hk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3E5DD"/><stop offset=".55" stop-color="#EEF2E6"/><stop offset="1" stop-color="#FBF5E8"/></linearGradient>'
  '<linearGradient id="hk-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF7" stop-opacity="0"/><stop offset=".5" stop-color="#FFFDF7" stop-opacity=".8"/><stop offset="1" stop-color="#FFFDF7" stop-opacity="0"/></linearGradient>'
  '<radialGradient id="hk-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FBE6AE"/><stop offset=".5" stop-color="#F8E3B2" stop-opacity=".5"/><stop offset="1" stop-color="#F8E3B2" stop-opacity="0"/></radialGradient>'
  '<path id="hk-leaf" d="M0 0 C 8 -8, 26 -10, 40 -2 C 26 6, 10 6, 0 0 Z"/></defs>')
o(f'<rect width="{W}" height="{H}" fill="url(#hk-sky)"/>')
sx = 260 if kind=='coffee' else 950
o(f'<circle cx="{sx}" cy="170" r="150" fill="url(#hk-sun)"/><circle cx="{sx}" cy="170" r="42" fill="#FBEBC3"/>')
for cx,cy,s in [(620,110,.9),(1040,90,.7),(120,130,.6)]:
    o(f'<g fill="#FFFFFF" fill-opacity=".85" transform="translate({cx} {cy}) scale({s})"><ellipse cx="0" cy="2" rx="78" ry="18"/><ellipse cx="-32" cy="-10" rx="34" ry="22"/><ellipse cx="16" cy="-18" rx="42" ry="30"/></g>')
yA=lambda x: 340-110*g(x,820,140)-70*g(x,560,120)-60*g(x,140,130)+6*math.sin(x/41)+4*math.sin(x/15)
yB=lambda x: 430-45*g(x,300,190)-40*g(x,980,160)+6*math.sin(x/60+1)
yC=lambda x: 560-16*math.sin(x/210+0.4)+7*math.sin(x/70)
yD=lambda x: 705-18*math.sin(x/170+1.2)+6*math.sin(x/55)
o(f'<path d="{area(yA, step=6)}" fill="#AFC6BD"/>')
o('<rect x="0" y="310" width="1200" height="120" fill="url(#hk-mist)"/>')
o(f'<path d="{area(yB)}" fill="#8FB1A0"/>')
o('<rect x="0" y="410" width="1200" height="90" fill="url(#hk-mist)" opacity=".7"/>')
def oak(x, base, h, seed):
    r=random.Random(seed)
    o(f'<path d="M{x-6} {base} L{x-2} {base-h} L{x+2} {base-h} L{x+6} {base} Z" fill="#6B5444"/>')
    for k in range(9):
        side=1 if k%2 else -1; yy=base-h+12+k*h/12
        o(f'<ellipse cx="{x+side*r.uniform(8,16):.0f}" cy="{yy:.0f}" rx="{r.uniform(14,22)-k*0.8:.0f}" ry="{r.uniform(8,11):.0f}" fill="{r.choice(["#4F7F50","#5E8F5A","#3E6B45"])}"/>')
def bush(x, y, s, seed, cherries=True):
    r=random.Random(seed)
    for k in range(26):
        a=r.uniform(-math.pi,0); rad=r.uniform(0.2,1)
        cx=x+math.cos(a)*70*s*rad; cy=y+math.sin(a)*60*s*rad
        o(f'<use href="#hk-leaf" transform="translate({cx:.0f} {cy:.0f}) rotate({r.uniform(-60,240):.0f}) scale({s*r.uniform(0.9,1.3):.2f})" fill="{r.choice(["#3E7A3A","#4E8A47","#2F6A31","#5E9A52"])}"/>')
    if cherries:
        for k in range(9):
            a=r.uniform(-math.pi,0); rad=r.uniform(0.2,0.8)
            cx=x+math.cos(a)*60*s*rad; cy=y+math.sin(a)*50*s*rad
            for b in range(4):
                o(f'<circle cx="{cx+b*4.2*s:.1f}" cy="{cy+(b%2)*3:.1f}" r="{3.4*s:.1f}" fill="{r.choice(["#B3262B","#C8362F","#9C2027","#D9542E","#7DA04A"])}"/>')
def picker(x,y,col,s=1.0,flip=False):
    sc=-s if flip else s
    o(f'<g transform="translate({x} {y}) scale({sc} {s})">'
      f'<path d="M-9 -67 C 1 -72 10 -68 12 -58 L17 -20 C17 -8 10 2 0 2 L-15 2 C-20 -10 -18 -31 -16 -45 C-15 -57 -13 -64 -9 -67 Z" fill="{col}"/>'
      '<path d="M-7 -67 C 4 -61 11 -48 15 -27 L8 -27 C4 -43 -1 -53 -9 -61 Z" fill="#fff" fill-opacity=".3"/>'
      '<path d="M6 -58 C18 -54 27 -45 34 -35" stroke="#7E4F31" stroke-width="5.5" fill="none" stroke-linecap="round"/><circle cx="35" cy="-34" r="3.6" fill="#7E4F31"/>'
      '<circle cx="2" cy="-78" r="9" fill="#7E4F31"/><circle cx="-7.5" cy="-79" r="5.6" fill="#21160F"/>'
      '<path d="M-6.5 -80 C-5 -89 9 -91 11.5 -81 C6 -85 -1 -85 -6.5 -80 Z" fill="#21160F"/>'
      '<path d="M-17 -38 C -28 -34, -30 -20, -25 -10 L -8 -12 Z" fill="#B07C44"/>'
      '</g>')
if kind=='coffee':
    for x,h,sd in [(140,300,1),(470,260,2),(760,320,3),(1080,290,4)]:
        oak(x, yC(x)+10, h, sd)
    o(f'<path d="{area(yC)}" fill="#4A7A44"/>')
    for i,x in enumerate(range(40,1200,120)):
        bush(x, yC(x)+40, 0.9, 10+i)
    # drying yard: a pale patio with spread cherries
    o(f'<path d="{area(yD)}" fill="#355F31"/>')
    o('<path d="M620 760 L1190 740 L1200 880 L560 900 Z" fill="#E9DCC3"/>')
    rr=random.Random(5)
    for k in range(260):
        px=rr.uniform(600,1190); py=rr.uniform(760,890)
        if py < 760+(px-620)*(-20/570)+4: continue
        o(f'<circle cx="{px:.0f}" cy="{py:.0f}" r="{rr.uniform(3,4.5):.1f}" fill="{rr.choice(["#7A3B22","#8E4A2A","#6B2F1C","#A0522D"])}"/>')
    o('<path d="M700 790 l60 -6" stroke="#8B5C2E" stroke-width="5" stroke-linecap="round"/><path d="M760 784 l18 26" stroke="#8B5C2E" stroke-width="4" stroke-linecap="round"/>')
    for i,x in enumerate([60,220,420]):
        bush(x, yD(x)+80, 1.4, 40+i)
    picker(330, yC(330)+52, '#B8245E', 1.5)
    picker(880, yC(880)+52, '#23807C', 1.5, flip=True)
else:
    for x,h,sd in [(120,300,1),(1100,280,4)]:
        oak(x, yC(x)+10, h, sd)
    o(f'<path d="{area(yC)}" fill="#4A7A44"/>')
    o(f'<path d="{area(yD)}" fill="#3F6B3A"/>')
    rr=random.Random(9)
    # wildflowers
    for k in range(220):
        fx=rr.uniform(0,1200); fy=rr.uniform(yC(fx)+20, 890)
        c=rr.choice(['#F2C14E','#F6D77A','#E9A3C0','#FFFFFF','#C9B6EA','#F2C14E'])
        o(f'<circle cx="{fx:.0f}" cy="{fy:.0f}" r="{rr.uniform(2.5,5):.1f}" fill="{c}"/>')
    # bee boxes on stands
    def hive(x,y,s):
        o(f'<g transform="translate({x} {y}) scale({s})">'
          '<path d="M-40 0 L-36 40 M40 0 L36 40" stroke="#6B5444" stroke-width="6" stroke-linecap="round"/>'
          '<rect x="-46" y="-70" width="92" height="70" rx="4" fill="#E2B866"/>'
          '<rect x="-46" y="-36" width="92" height="4" fill="#C79A45"/>'
          '<path d="M-54 -70 L54 -70 L46 -88 L-46 -88 Z" fill="#B9863F"/>'
          '<rect x="-14" y="-12" width="28" height="6" rx="3" fill="#5A3E22"/>'
          '</g>')
    hive(420, yD(420)+30, 1.3); hive(640, yD(640)+20, 1.15); hive(860, yD(860)+34, 1.35)
    for k in range(16):
        bx=rr.uniform(380,920); by=rr.uniform(yD(640)-150, yD(640)-40)
        o(f'<g transform="translate({bx:.0f} {by:.0f})"><ellipse rx="5" ry="3.6" fill="#F2B632"/><path d="M-1.5 -3.4 v6.8 M1.8 -3.2 v6.4" stroke="#3A2A12" stroke-width="1.4"/><ellipse cx="-1" cy="-5" rx="3.6" ry="2.4" fill="#fff" fill-opacity=".85"/></g>')
    picker(230, yD(230)+70, '#E08A23', 1.6)
o('</svg>')
sys.stdout.write('\n'.join(out))
