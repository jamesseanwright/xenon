with(c){x=new AudioContext,t=[0,3,5,7],n=x.createOscillator(),n.frequency.value=1,n.connect(x.destination),n.start(),f=1,o=0,r=0,m=e=>e%2|0?[e%2|0?-29:480,e%480]:[e%480,e%2|0?-29:480],d=e=>e.map(e=>-29===e?1.9:480===e?-1.9:0),l=[220,220],p=[2.4,0],u=1,h=[1,2,3].map(e=>m(125*e)).map((e,t)=>({t:e,x:d(e),s:1,i:1e3*t})),q={},this.onkeydown=(t=>{x.resume(),q[t.key]=!r}),this.onkeyup=(e=>{q[e.key]=0}),A=v=>{v%(333-f*16)<16.66&&(n.frequency.value=18.4*1.059**t[(v+20)%4|0]*8),fillStyle="#000",fillRect(0,0,480,480),h.map(t=>{if(t.s&&t.i<v&&(t.s=0),!t.s&&(t.t.some(e=>e<-29||e>480)&&(t.t=m(v),t.x=d(t.t),t.i=v),t.x.map((e,s)=>{t.t[s]+=e*f/3}),translate(t.t[0]+14.4,t.t[1]+14.4),rotate(.002*v),fillStyle="#bce",font="180% sans-serif",fillText("X",-9.93,10.3),resetTransform(),l[0]+41>=t.t[0]&&l[0]<=t.t[0]+29&&l[1]+41>=t.t[1]&&l[1]<=t.t[1]+29)){u=1,(o+=1)%8==0&&f++,t.t=m(v),t.x=d(t.t),t.i=v,sf=x.createOscillator(),sf.frequency.value=340,sf.connect(x.destination),sf.start(v/1e3),sf.stop(v/1e3+.02)}}),u<=0?r=1:u-=.002,p.map((e,t)=>{l[t]+=e}),q.x&&(p=[-p[1],p[0]],q.x=0),translate(l[0]+20.6,l[1]+20.6),rotate(Math.atan2(p[1],p[0])),beginPath(),moveTo(-20.4,-20.4),lineTo(20.4,5.1),lineTo(-20.4,20.4),closePath(),fillStyle='#fff',fill(),resetTransform(),r&&fillText("😭",224,232),fillStyle="#ff0",fillRect(24,24,432*u,4.8),requestAnimationFrame(A)},requestAnimationFrame(A)}
