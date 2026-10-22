# Proverava da je sve.json identičan sadržaju sa živog sajta (otisak po strani, izračunat u pregledaču na živom sajtu)
import json,hashlib,os
d=os.path.dirname(os.path.abspath(__file__))
H=json.load(open(os.path.join(d,'hashes.json')));D=json.load(open(os.path.join(d,'sve.json'),encoding='utf-8'))
ok=0
for k in H:
    s=json.dumps(D.get(k),ensure_ascii=False,separators=(',',':'))
    h=hashlib.sha256(s.encode()).hexdigest()[:16];ok+=h==H[k]
    if h!=H[k]:print('RAZLIKA',k)
print(ok,'/',len(H),'strana identično originalu')
