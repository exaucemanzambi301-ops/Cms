import os
import re
import glob
import shutil

root = os.path.abspath(os.path.dirname(__file__))
assets_css = os.path.join(root, 'assets', 'css')
assets_js = os.path.join(root, 'assets', 'js')
os.makedirs(assets_css, exist_ok=True)
os.makedirs(assets_js, exist_ok=True)

for path in glob.glob(os.path.join(root, '*.css')):
    dest = os.path.join(assets_css, os.path.basename(path))
    if os.path.abspath(path) != os.path.abspath(dest):
        shutil.move(path, dest)

for path in glob.glob(os.path.join(root, '*.js')):
    dest = os.path.join(assets_js, os.path.basename(path))
    if os.path.abspath(path) != os.path.abspath(dest):
        shutil.move(path, dest)

css_pattern = re.compile(r'href="([^"]+?)\.css"')
js_pattern = re.compile(r'src="([^"]+?)\.js"')

for path in glob.glob(os.path.join(root, '*.html')):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = css_pattern.sub(lambda m: f'href="assets/css/{os.path.basename(m.group(1))}.css"', content)
    content = js_pattern.sub(lambda m: f'src="assets/js/{os.path.basename(m.group(1))}.js"', content)
    content = content.replace('href="Cms.html"', 'href="index.html"')
    content = content.replace('href="Rdv.html""', 'href="Rdv.html"')
    if path.endswith('Cms.html'):
        content = content.replace('<link rel="stylesheet" href="Rdv.html">\n', '')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

cms_path = os.path.join(root, 'Cms.html')
index_path = os.path.join(root, 'index.html')
if os.path.exists(cms_path):
    with open(cms_path, 'r', encoding='utf-8') as f:
        cms_content = f.read()
    cms_content = css_pattern.sub(lambda m: f'href="assets/css/{os.path.basename(m.group(1))}.css"', cms_content)
    cms_content = cms_content.replace('href="Cms.html"', 'href="index.html"')
    cms_content = cms_content.replace('<link rel="stylesheet" href="Rdv.html">\n', '')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(cms_content)

print('done')
