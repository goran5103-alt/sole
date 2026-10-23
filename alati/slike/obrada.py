import os,sys,time
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))+'/pylib')
import torch,torch.nn as nn,torch.nn.functional as F,numpy as np
from safetensors.torch import load_file
from PIL import Image,ImageFilter,ImageEnhance
torch.set_num_threads(4)
HERE=os.path.dirname(os.path.abspath(__file__))
class RDB(nn.Module):
    def __init__(s,nf=64,gc=32):
        super().__init__()
        s.conv1=nn.Conv2d(nf,gc,3,1,1);s.conv2=nn.Conv2d(nf+gc,gc,3,1,1);s.conv3=nn.Conv2d(nf+2*gc,gc,3,1,1)
        s.conv4=nn.Conv2d(nf+3*gc,gc,3,1,1);s.conv5=nn.Conv2d(nf+4*gc,nf,3,1,1);s.lrelu=nn.LeakyReLU(.2,True)
    def forward(s,x):
        x1=s.lrelu(s.conv1(x));x2=s.lrelu(s.conv2(torch.cat((x,x1),1)));x3=s.lrelu(s.conv3(torch.cat((x,x1,x2),1)))
        x4=s.lrelu(s.conv4(torch.cat((x,x1,x2,x3),1)));x5=s.conv5(torch.cat((x,x1,x2,x3,x4),1));return x5*.2+x
class RRDB(nn.Module):
    def __init__(s,nf=64,gc=32):
        super().__init__();s.rdb1=RDB(nf,gc);s.rdb2=RDB(nf,gc);s.rdb3=RDB(nf,gc)
    def forward(s,x): return s.rdb3(s.rdb2(s.rdb1(x)))*.2+x
class Net(nn.Module):
    def __init__(s,nb=23,nf=64,gc=32):
        super().__init__()
        s.conv_first=nn.Conv2d(3,nf,3,1,1);s.body=nn.Sequential(*[RRDB(nf,gc) for _ in range(nb)]);s.conv_body=nn.Conv2d(nf,nf,3,1,1)
        s.conv_up1=nn.Conv2d(nf,nf,3,1,1);s.conv_up2=nn.Conv2d(nf,nf,3,1,1);s.conv_hr=nn.Conv2d(nf,nf,3,1,1);s.conv_last=nn.Conv2d(nf,3,3,1,1);s.lrelu=nn.LeakyReLU(.2,True)
    def forward(s,x):
        f=s.conv_first(x);f=f+s.conv_body(s.body(f))
        f=s.lrelu(s.conv_up1(F.interpolate(f,scale_factor=2,mode='nearest')));f=s.lrelu(s.conv_up2(F.interpolate(f,scale_factor=2,mode='nearest')))
        return s.conv_last(s.lrelu(s.conv_hr(f)))
net=Net();net.load_state_dict(load_file(HERE+'/RealESRGAN_x4plus.safetensors'));net.eval()
def sr4(im,tile=128,pad=12):
    a=torch.from_numpy(np.asarray(im.convert('RGB'),dtype=np.float32)/255).permute(2,0,1)[None]
    _,_,h,w=a.shape;out=torch.zeros(1,3,h*4,w*4)
    with torch.no_grad():
        for y in range(0,h,tile):
            for x in range(0,w,tile):
                y0,x0=max(y-pad,0),max(x-pad,0);y1,x1=min(y+tile+pad,h),min(x+tile+pad,w)
                o=net(a[:,:,y0:y1,x0:x1])
                oy,ox=(y-y0)*4,(x-x0)*4;th,tw=min(tile,h-y)*4,min(tile,w-x)*4
                out[:,:,y*4:y*4+th,x*4:x*4+tw]=o[:,:,oy:oy+th,ox:ox+tw]
    return Image.fromarray((out[0].permute(1,2,0).clamp(0,1).numpy()*255+.5).astype(np.uint8))
def grade(im):
    """Završna obrada: oštrina, lokalni kontrast i blago pojačane boje, da fotografija izgleda sjajno i oštro na ekranu visoke rezolucije."""
    im=im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=55,threshold=2))
    im=im.filter(ImageFilter.UnsharpMask(radius=18,percent=22,threshold=0))   # lokalni kontrast (clarity)
    im=ImageEnhance.Contrast(im).enhance(1.07)
    im=ImageEnhance.Color(im).enhance(1.08)
    return im
if __name__=='__main__':
    names=sys.argv[1:]
    for k in names:
        t=time.time();src=Image.open(f'{HERE}/src/{k}.jpg').convert('RGB')
        big=sr4(src);W=1280
        h=round(big.height*W/big.width);out=grade(big.resize((W,h),Image.LANCZOS))
        out.save(f'{HERE}/out/{k}.jpg',quality=84,optimize=True,progressive=True,subsampling=0)
        print(k,src.size,'->',out.size,os.path.getsize(f'{HERE}/out/{k}.jpg')//1024,'KB',round(time.time()-t),'s',flush=True)
