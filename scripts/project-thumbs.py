"""Builds the uniform project thumbnails (assets/projects/<id>.jpg, 1600x1000)
from scripts/project-thumbs.json with ImageMagick. Run by the project-thumbs action."""
import json, os, subprocess, sys, tempfile, urllib.request

W, H, GAP = 1600, 1000, 8
spec = json.load(open('scripts/project-thumbs.json'))
only = set(filter(None, (os.environ.get('ONLY') or '').split(',')))
os.makedirs('assets/projects', exist_ok=True)
tmp = tempfile.mkdtemp()

def fetch(src, i):
    if not src.startswith('http'):
        return src
    path = os.path.join(tmp, 'src%d' % i)
    urllib.request.urlretrieve(src, path)
    return path

def im(*args):
    subprocess.run(['convert'] + [str(a) for a in args], check=True)

def crop(path, w, h, y, out):
    # fill w x h, then take the slot y% of the way down the spare height
    tw, th = map(int, subprocess.check_output(['convert', path, '-resize', '%dx%d^' % (w, h), '-format', '%w %h', 'info:']).split())
    ox, oy = (tw - w) // 2, (th - h) * y // 100
    im(path, '-resize', '%dx%d^' % (w, h), '-crop', '%dx%d+%d+%d' % (w, h, ox, oy), '+repage', out)

n = 0
for p in spec['projects']:
    if only and p['id'] not in only:
        continue
    srcs = [fetch(s, n * 10 + i) for i, s in enumerate(p.get('src', []))]
    if p.get('video'):
        # stills pulled from the film itself, at fractions of its running time
        film = fetch(p['video'], n * 10 + 9)
        dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', film]).strip())
        for j, f in enumerate(p.get('frames', [0.5])):
            fr = os.path.join(tmp, 'f%d_%d.png' % (n, j))
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '%.2f' % (dur * f), '-i', film, '-frames:v', '1', fr], check=True)
            srcs.append(fr)
    out = 'assets/projects/%s.jpg' % p['id']
    y = p.get('y', 50)
    part = os.path.join(tmp, 'part.png')
    if p['layout'] == 'cover':
        crop(srcs[0], W, H, y, part)
    elif p['layout'] == 'region':
        # zoom: crop a box given as fractions of the source (x0, y0, x1, y1), then fill the card
        sw, sh = map(int, subprocess.check_output(['convert', srcs[0], '-format', '%w %h', 'info:']).split())
        x0, y0, x1, y1 = p['box']
        box = os.path.join(tmp, 'box.png')
        im(srcs[0], '-crop', '%dx%d+%d+%d' % (round((x1 - x0) * sw), round((y1 - y0) * sh), round(x0 * sw), round(y0 * sh)), '+repage', box)
        crop(box, W, H, 50, part)
    elif p['layout'] == 'row':
        k = len(srcs); w = (W - GAP * (k - 1)) // k
        pieces = []
        for i, s in enumerate(srcs):
            pp = os.path.join(tmp, 'p%d.png' % i); crop(s, w, H, y, pp); pieces.append(pp)
        args = []
        for i, pp in enumerate(pieces):
            if i: args += ['-size', '%dx%d' % (GAP, H), 'xc:#000000']
            args.append(pp)
        im(*args, '+append', '-resize', '%dx%d!' % (W, H), part)
    elif p['layout'] == 'blur':
        bg = os.path.join(tmp, 'bg.png'); crop(srcs[0], W, H, 50, bg)
        im(bg, '-blur', '0x28', '-modulate', '55', bg)
        im(bg, '(', srcs[0], '-resize', 'x%d' % H, ')', '-gravity', 'center', '-composite', part)
    im(part, '-strip', '-interlace', 'Plane', '-quality', '84', out)
    print(out, os.path.getsize(out))
    n += 1
