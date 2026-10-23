import os,subprocess,json,sys
sys.path.insert(0,'/home/user/sole/alati')
import build as B
S=os.popen('ls -d /tmp/claude-0/-home-user-sole/5f70d343*/scratchpad').read().strip()
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"
H='https://sole.izradasajtovasajta.com/wp-content/uploads/2024/12/'
SRC={'lignit':H+'ugalj2-1.jpg','mrko':H+'loznica-ogrev-ugalj-potraznja-1328585176-110912.jpg','suseni':H+'Kolubara-vagonske-isporuke-1.jpg',
 'mrki':H+'rudnuk_banovici_682568594.jpg','kameni':H+'Ruski-ugalj-22-1.jpg','antracit':H+'926550_83409660-e1296078619294.jpg',
 'koks':'https://sole.izradasajtovasajta.com'+B.photo('/koks/').split('co.rs',1)[1],'pelet':H+'Miboro-Pelet-Bukva.jpg','zar':H+'RB-Kolubara-1.x.jpg'}
from PIL import Image
for k,u in SRC.items():
    o=f'{S}/sr/src/{k}.jpg'
    subprocess.run(['curl','-sS','-m','60','-A',UA,'-o',o,u])
    im=Image.open(o); print(k,im.size,os.path.getsize(o))
