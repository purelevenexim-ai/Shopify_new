# Spice garden scene (cardamom + pepper under shade trees, Idukki). Same language as tc_hills_art.py.
import math, random, sys
random.seed(7)
W,H=1200,900
def pts(f, x0=-30, x1=1230, step=10): return [(x, f(x)) for x in range(x0, x1+1, step)]
def poly(points): return 'M'+' L'.join(f'{x:.0f} {y:.0f}' for x,y in points)
def area(f, step=10): p=pts(f,step=step); return poly(p)+f' L1230 {H+20} L-30 {H+20} Z'
g=lambda x,c,w: math.exp(-((x-c)/w)**2)
yA=lambda x: 330-95*g(x,250,150)-70*g(x,110,120)-80*g(x,960,160)-45*g(x,640,110)+6*math.sin(x/41)+4*math.sin(x/15)
yB=lambda x: 420-50*g(x,880,180)-35*g(x,300,160)+6*math.sin(x/60+1)
yC=lambda x: 560-16*math.sin(x/210+0.4)+7*math.sin(x/70)
yD=lambda x: 700-18*math.sin(x/170+1.2)+6*math.sin(x/55)
out=[]; o=out.append
o(f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: picking cardamom and pepper under shade trees in Idukki" preserveAspectRatio="xMidYMid slice">')
o('<defs>')
o('<linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3E5DD"/><stop offset=".55" stop-color="#EEF2E6"/><stop offset="1" stop-color="#FBF5E8"/></linearGradient>')
o('<linearGradient id="hs-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF7" stop-opacity="0"/><stop offset=".5" stop-color="#FFFDF7" stop-opacity=".8"/><stop offset="1" stop-color="#FFFDF7" stop-opacity="0"/></linearGradient>')
o('<radialGradient id="hs-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FBE6AE"/><stop offset=".5" stop-color="#F8E3B2" stop-opacity=".5"/><stop offset="1" stop-color="#F8E3B2" stop-opacity="0"/></radialGradient>')
o('<linearGradient id="hs-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F6B3A"/><stop offset="1" stop-color="#2E5230"/></linearGradient>')
# cardamom leaf (long lanceolate), drawn pointing up from origin
o('<path id="hs-leaf" d="M0 0 C 14 -6, 46 -14, 96 -6 C 62 6, 24 10, 0 0 Z"/>')
o('</defs>')
o(f'<rect width="{W}" height="{H}" fill="url(#hs-sky)"/>')
o('<circle cx="930" cy="170" r="150" fill="url(#hs-sun)"/><circle cx="930" cy="170" r="42" fill="#FBEBC3"/>')
for cx,cy,s in [(560,120,.9),(160,90,.7),(1100,110,.6)]:
    o(f'<g fill="#FFFFFF" fill-opacity=".85" transform="translate({cx} {cy}) scale({s})"><ellipse cx="0" cy="2" rx="78" ry="18"/><ellipse cx="-32" cy="-10" rx="34" ry="22"/><ellipse cx="16" cy="-18" rx="42" ry="30"/></g>')
o(f'<path d="{area(yA, step=6)}" fill="#AFC6BD"/>')
o('<rect x="0" y="300" width="1200" height="120" fill="url(#hs-mist)"/>')
o(f'<path d="{area(yB)}" fill="#8FB1A0"/>')
o('<rect x="0" y="400" width="1200" height="90" fill="url(#hs-mist)" opacity=".7"/>')
# shade trees with pepper vines
def tree(x, base, h, w, seed, vine=True):
    r=random.Random(seed)
    o(f'<path d="M{x-w/2:.0f} {base} C {x-w/2:.0f} {base-h*0.5:.0f}, {x-w*0.35:.0f} {base-h*0.85:.0f}, {x-w*0.2:.0f} {base-h:.0f} L {x+w*0.2:.0f} {base-h:.0f} C {x+w*0.35:.0f} {base-h*0.85:.0f}, {x+w/2:.0f} {base-h*0.5:.0f}, {x+w/2:.0f} {base} Z" fill="#6B5444"/>')
    o(f'<path d="M{x-w*0.15:.0f} {base} C {x-w*0.12:.0f} {base-h*0.5:.0f}, {x-w*0.08:.0f} {base-h*0.8:.0f}, {x-w*0.05:.0f} {base-h:.0f}" stroke="#7E6553" stroke-width="{w*0.12:.1f}" fill="none"/>')
    # canopy
    cy=base-h
    for layer,col in enumerate(['#3E6B45','#4F7F50','#62925A','#78A867']):
        for k in range([9,8,6,4][layer]):
            cx=x+r.uniform(-1,1)*(110-layer*14); yy=cy-r.uniform(0,60)+layer*6-20
            o(f'<ellipse cx="{cx:.0f}" cy="{yy:.0f}" rx="{r.uniform(34,52)-layer*4:.0f}" ry="{r.uniform(22,32)-layer*3:.0f}" fill="{col}"/>')
    if vine:
        # pepper vine spiralling up the trunk
        segs=[]; yy=base
        side=1; d=''
        pts_=[]
        for i in range(0,int(h*0.92),6):
            yy=base-i; xx=x+math.sin(i/22)*w*0.55
            pts_.append((xx,yy))
        o(f'<path d="{poly(pts_)}" stroke="#2F5A2E" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
        for i in range(8,len(pts_)-4,5):
            xx,yy=pts_[i]; s=1 if (i//5)%2 else -1
            o(f'<path d="M{xx:.0f} {yy:.0f} c {s*6} -10, {s*22} -12, {s*26} 2 c {s*-6} 12, {s*-20} 10, {s*-26} -2 Z" fill="#3F7A3A"/>')
            if (i//5)%2==0:
                # hanging pepper spike: green berries, some turning red
                col = r.choice(['#B33A2A','#C8562B','#4F8A34','#4F8A34','#5E9A3A'])
                o(f'<path d="M{xx+s*6:.0f} {yy+2:.0f} q {s*3} 18 {s*1} 36" stroke="#3F6B2E" stroke-width="1.4" fill="none"/>')
                for b in range(8):
                    o(f'<circle cx="{xx+s*(7+math.sin(b*1.3)*1.6):.1f}" cy="{yy+6+b*4.3:.1f}" r="3.1" fill="{col}"/>')
tree(160, yC(160)+20, 330, 34, 3)
tree(1010, yC(1010)+20, 360, 38, 9)
tree(640, yC(640)+10, 250, 24, 5, vine=False)
# ground
o(f'<path d="{area(yC)}" fill="#4A7A44"/>')
# cardamom clumps: upright stems, broad leaves in two rows, pods on runners at the base
def clump(x, y, s, seed, n=6, h=280):
    r=random.Random(seed)
    for k in range(n):
        lean=(k-(n-1)/2)*7+r.uniform(-4,4)
        hh=h*r.uniform(0.75,1.05)*s
        tx=x+math.sin(math.radians(lean))*hh; ty=y-math.cos(math.radians(lean))*hh
        cx=x+(tx-x)*0.4+r.uniform(-8,8)
        o(f'<path d="M{x+(k-n/2)*4:.0f} {y} Q {cx:.0f} {y-hh*0.55:.0f} {tx:.0f} {ty:.0f}" stroke="#4A7D3F" stroke-width="{4*s:.1f}" fill="none" stroke-linecap="round"/>')
        m=7
        for j in range(1,m+1):
            t=j/(m+0.6)
            px=(1-t)**2*(x+(k-n/2)*4)+2*(1-t)*t*cx+t*t*tx; py=(1-t)**2*y+2*(1-t)*t*(y-hh*0.55)+t*t*ty
            side=1 if (j+k)%2 else -1
            ang=(-25 if side>0 else 205)+lean+r.uniform(-10,10)+(1-t)*18*side
            sc=(0.55+0.5*(1-abs(t-0.55)))*s
            col=r.choice(['#4E8A47','#5E9A52','#6FAA5E','#447D3F','#58934C'])
            o(f'<use href="#hs-leaf" transform="translate({px:.0f} {py:.0f}) rotate({ang:.0f}) scale({sc:.2f} {sc*(1 if side>0 else -1):.2f})" fill="{col}"/>')
    for k in range(4):
        px=x+r.uniform(-70,70)*s; py=y+r.uniform(2,12)
        o(f'<path d="M{px-18*s:.0f} {py:.0f} Q {px:.0f} {py-8:.0f} {px+20*s:.0f} {py+3:.0f}" stroke="#4C7A3C" stroke-width="2" fill="none"/>')
        for b in range(4):
            o(f'<ellipse cx="{px-10*s+b*7*s:.1f}" cy="{py-2+(b%2)*3:.1f}" rx="{3.8*s:.1f}" ry="{2.6*s:.1f}" fill="#A3CB77"/>')
o(f'<path d="{area(yD)}" fill="#355F31"/>')
rr=random.Random(4)
for k in range(70):
    lx=rr.uniform(0,1200); ly=yD(lx)+rr.uniform(14,200)
    o(f'<ellipse cx="{lx:.0f}" cy="{ly:.0f}" rx="{rr.uniform(10,22):.0f}" ry="{rr.uniform(3,6):.0f}" fill="{rr.choice(["#40703A","#4A7A42","#3B6835"])}" transform="rotate({rr.uniform(-20,20):.0f} {lx:.0f} {ly:.0f})"/>')
for k in range(14):
    lx=rr.uniform(0,1200); ly=yD(lx)+rr.uniform(20,190)
    o(f'<ellipse cx="{lx:.0f}" cy="{ly:.0f}" rx="9" ry="3.5" fill="#B9925A" fill-opacity=".8" transform="rotate({rr.uniform(-40,40):.0f} {lx:.0f} {ly:.0f})"/>')
clump(300, yC(300)+40, 0.9, 11, 5, 230)
clump(560, yC(560)+40, 0.8, 12, 5, 220)
clump(1120, yC(1120)+40, 0.85, 14, 5, 230)
clump(90, yD(90)+60, 1.2, 15, 6)
clump(860, yD(860)+70, 1.25, 13, 7)
# crouching cardamom picker (left of the 820 clump)
def crouch(x,y,col,s=1.0,flip=False):
    sx=-s if flip else s
    o(f'<g transform="translate({x} {y}) scale({sx} {s})">'
      f'<path d="M-30 0 C -36 -30, -28 -62, -6 -70 C 14 -74, 26 -58, 28 -36 C 30 -18, 26 -4, 18 0 Z" fill="{col}"/>'
      '<path d="M-6 -70 C 6 -64, 16 -50, 20 -30 L 12 -30 C 8 -46, 2 -56, -10 -62 Z" fill="#fff" fill-opacity=".28"/>'
      '<path d="M14 -52 C 30 -44, 44 -30, 56 -14" stroke="#7E4F31" stroke-width="6" fill="none" stroke-linecap="round"/>'
      '<circle cx="57" cy="-12" r="4" fill="#7E4F31"/>'
      '<circle cx="2" cy="-82" r="10" fill="#7E4F31"/>'
      '<path d="M-9 -84 C -8 -96, 10 -98, 13 -86 C 6 -90, -2 -90, -9 -84 Z" fill="#21160F"/>'
      '<circle cx="-9" cy="-82" r="5.5" fill="#21160F"/>'
      '</g>')
    # basket
    bx=x-(50 if not flip else -50)*s
    o(f'<g transform="translate({bx:.0f} {y})"><path d="M-22 -26 L22 -26 L16 0 L-16 0 Z" fill="#B07C44"/><path d="M-21 -17 L21 -17 M-19 -8 L19 -8" stroke="#8B5C2E" stroke-width="2"/><path d="M-22 -26 L22 -26" stroke="#8B5C2E" stroke-width="3"/>'
      + ''.join(f'<ellipse cx="{-14+i*7}" cy="-29" rx="4" ry="2.8" fill="#9BC46E"/>' for i in range(5)) + '</g>')
crouch(720, yD(720)+66, '#B8245E', 1.3)
# standing pepper picker at the right tree, reaching up
def stand(x,y,col,s=1.0):
    o(f'<g transform="translate({x} {y}) scale({s})">'
      f'<path d="M-9 -67 C 1 -72 10 -68 12 -58 L17 -20 C17 -8 10 2 0 2 L-15 2 C-20 -10 -18 -31 -16 -45 C-15 -57 -13 -64 -9 -67 Z" fill="{col}"/>'
      '<path d="M-7 -67 C 4 -61 11 -48 15 -27 L8 -27 C4 -43 -1 -53 -9 -61 Z" fill="#fff" fill-opacity=".3"/>'
      '<path d="M4 -60 C 14 -74, 20 -90, 24 -104" stroke="#7E4F31" stroke-width="5.5" fill="none" stroke-linecap="round"/>'
      '<circle cx="25" cy="-106" r="3.6" fill="#7E4F31"/>'
      '<circle cx="2" cy="-78" r="9" fill="#7E4F31"/>'
      '<circle cx="-7.5" cy="-79" r="5.6" fill="#21160F"/>'
      '<path d="M-6.5 -80 C-5 -89 9 -91 11.5 -81 C6 -85 -1 -85 -6.5 -80 Z" fill="#21160F"/>'
      '<path d="M-16 -40 C -30 -36, -34 -22, -28 -12 L -8 -14 Z" fill="#B07C44"/>'
      '</g>')
stand(985, yC(985)+42, '#E08A23', 1.6)
# foreground pod sprigs
def podsprig(x,y,rot,s):
    o(f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">'
      '<path d="M0 0 C 20 -30, 50 -50, 100 -60" stroke="#4C7A3C" stroke-width="4" fill="none" stroke-linecap="round"/>'
      + ''.join(f'<g transform="translate({20+i*18} {-18-i*9}) rotate({-30+i*6})"><ellipse rx="11" ry="7" fill="{c}"/><path d="M-9 0 L 9 0" stroke="#6E9B4D" stroke-width="1.2"/></g>' for i,c in enumerate(['#8DBA62','#9BC46E','#86B45C','#A3CB77']))
      + '<path d="M60 -48 C 90 -110, 150 -130, 190 -110 C 150 -90, 100 -70, 60 -48 Z" fill="#3D7A39"/>'
      '</g>')
podsprig(20, 905, -8, 1.1)
o('<g transform="translate(1180 905) scale(-1 1)">'); podsprig(0, 0, -8, 1.0); o('</g>')
o('</svg>')
sys.stdout.write('\n'.join(out))
