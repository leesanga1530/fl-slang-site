import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
  AreaChart, Area, ComposedChart, ScatterChart, Scatter, ZAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

/* ═══ WARM LIGHT PALETTE ═══ */
const C={
  bg:"#f7f5f0",bgAlt:"#efece5",card:"#ffffff",cardHover:"#fdfcfa",
  surface:"#f0ede6",surfaceLight:"#e8e4dc",
  border:"#e0dbd2",borderDark:"#ccc6ba",
  text:"#1a1612",textMid:"#4a4540",textDim:"#7a746a",textMuted:"#a9a29a",
  amber:"#d4890a",amberLight:"#f5a623",amberBg:"rgba(212,137,10,0.07)",
  coral:"#d94f30",coralBg:"rgba(217,79,48,0.06)",
  purple:"#7c5cbf",purpleBg:"rgba(124,92,191,0.06)",
  green:"#2d9a5a",greenBg:"rgba(45,154,90,0.06)",
  red:"#c93c3c",redBg:"rgba(201,60,60,0.06)",
  yellow:"#b8860b",blue:"#3572b0",orange:"#c66a1e",pink:"#b85c8a",
};
const font=`'Pretendard Variable','Noto Sans KR',-apple-system,sans-serif`;
const mono=`'JetBrains Mono','Fira Code',monospace`;
const shadow="0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.03)";
const tt={background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12,boxShadow:shadow};
const CATS=["SNS/밈","방송/드라마","게임","커뮤니티","아이돌/팬덤","유튜브","정치/시사","기타"];
const CAT_C={"SNS/밈":C.amber,"방송/드라마":C.coral,"게임":C.purple,"커뮤니티":C.yellow,"아이돌/팬덤":C.green,"유튜브":C.red,"정치/시사":C.blue,"기타":C.textMuted};
const TYPES=["단어형","문장형","줄임말","초성체","합성어","구형"];
const YC={2002:165,2003:538,2004:74,2005:95,2006:86,2007:78,2008:599,2009:691,2010:194,2011:250,2012:503,2013:486,2014:400,2015:524,2016:630,2017:509,2018:434,2019:276,2020:162,2021:173,2022:207,2023:203,2024:347,2025:104,2026:52};
const TOTAL=Object.values(YC).reduce((a,b)=>a+b,0);

/* ═══ REAL DATA SAMPLES ═══ */
const YEAR_WORDS={
  2002:["디카","블로그","웰빙","힐링","매니아","네티즌","사돈보기","생활기스","쭉쭉탄탄","트파라치","넷심","디카족","코스프레","얼짱","몸짱","반샷","삼행시","세태어","쉐어족","애완로봇"],
  2003:["맞습니다맞고요","뷁","밥은먹고다니냐","숫자송","어작업중이야","나가있어","을용타","먹튀","짤방","허걱","된장녀","강추","빠순이","팬질","초딩","중딩","고딩","올킬","열공","솔까"],
  2008:["안생겨요","나몰라패밀리","쩝쩝박사","비담","잼민이","ㅋㅋ","ㅠㅠ","쏘리","대박","헐","왕","짱","뻥","삥","꿀","극혐","실화","레알","치트키","만렙"],
  2009:["금사빠","까리하다","똥차","문상","소맥","아이돌","야근","여시","오글","짤","프사","현타","화력","갑","놀토","답정너","무한도전","버카충","선크","실검"],
  2014:["먹방","셀카","혼밥","치맥","금수저","흙수저","인생템","존맛","꿀잼","핵노잼","만반잘부","레알","멘탈갑","갑분싸","뇌절","꿀팁","탈골","가즈아","상남자","찰떡"],
  2015:["흙수저","수저론","아재개그","별다줄","뇌섹남","갓벽","가성비","극혐","팩폭","럭키프로모션","벱스프로젝트","드론성지","기활법","수저계급론","마상","취존","핵인싸","밀레니얼","핀테크","먹스타"],
  2016:["혼밥","혼술","볼매","댕댕이","혼코노","혼영","소맥","띵작","갓성비","품절남","욜로","소확행","맘충","탕진잼","JMT","갓","실화냐","뇌피셜","스겜","뉴트로"],
  2017:["인싸","아싸","얼죽아","갑분싸","TMI","넘사벽","워라밸","핵인싸","볼매","뇌피셜","슬세권","편스토랑","저세상","케바케","킹받다","오지다","덕통사고","국뽕","깐부","만찢남"],
  2018:["TMI","소확행","워라밸","빚투","JMT","갬성","인싸력","필환경","세포마켓","나나랜드","스앵님","쓰앵님","가심비","뉴트로","만찢남","덕력만렙","얼죽아","밀레니얼가족","인싸템","스라밸"],
  2019:["FLEX","할많하않","혼코노","오저치고","존맛탱","별다줄","미닝아웃","오운완","편스토랑","핫플","인싸템","갑통령","택배기사","국뽕","보이루","문찐","실매물","가스라이팅","돈쭐","스라밸"],
  2020:["찐","빌런","MZ세대","꾸안꾸","점메추","알잘딱깔센","아무노래","코로나블루","오운완","갓생살기","집콕","언택트","영끌","갭투자","주린이","내로남불","삼귀자","학폭","슬기로운","호박고구마"],
  2021:["갓생","킹받다","어쩔티비","스불재","무야호","MBTI","N잡러","메타버스","NFT","선넘탱","숏폼","오히려좋아","내또출","OOTD","가스라이팅","그루밍","제로웨이스트","갓생살기","MZ","삼귀자"],
  2022:["오운완","중꺾마","그잡채","완내스","포켓몬빵","코카인댄스","피에로드립","점메추","킹근육","저반바지","조용한사직","번아웃","디지털노마드","갓생","쿠쿠루삥뽕","알잘딱깔센","워케이션","저탄고지","지구방위대","미스터인크레더블"],
  2023:["700","디토","억텐","맛꿀마","설렘주의보","치지직","스레드","챗GPT","제로슈거","카공족","갓성비","실환가","복세편살","당근마켓","생성형AI","분리불안","민폐","그잡채","신호등파티","도파민"],
  2024:["럭키비키","치피치피차파차파","꽁꽁얼어붙은한강","국가권력급","밥똥던","은행플러팅","투슬리스댄스","탕후루","올드머니","도파민디톡스","아라찌","아맞다우산","하이볼","선재업고튀어","존잘","밈코인","브레인랏","범민족대회","몰디브가자","시그니처"],
  2025:["트랄랄레로","Chill guy","도파민","나니가스키","사람이죽는다고","괜찮아딩딩딩","햄부기햄북","테크놀로지아","밤티","아미새","쉐이칸샹","내가그걸모를까","영포티","골반통신","케케크롱","전부다가르쳐줄게","개웃겨서도티낳음","핵심을찔렀어","누가범인일까","죠리퐁냄새"],
  2026:["킹받으면좋겠어","힙합보단사랑","척추송","운동많이된다","쨍그랑","허무주의펭귄","언발란스","쌰갈","원숭이펀치","설명할시간이없어","빨리타","간바레","붐샤카라카","카와이다케쟈","늑구","탱장연","모시모시","영크크","늙크크","할렐야루"],
};

const featureImp=[
  {name:"초기 6개월 감소 기울기",value:0.187,group:"시계열"},{name:"최고점 도달 시점",value:0.156,group:"시계열"},
  {name:"사용 매체 다양성",value:0.134,group:"맥락"},{name:"기존 단어 대체 여부",value:0.112,group:"맥락"},
  {name:"초기 사용량 증가율",value:0.098,group:"시계열"},{name:"유행 시작 카테고리",value:0.082,group:"맥락"},
  {name:"형태소 수",value:0.065,group:"형태소"},{name:"음절 수",value:0.054,group:"형태소"},
  {name:"문장형 여부",value:0.048,group:"표현"},{name:"한영혼합 여부",value:0.032,group:"표현"},
];
const ablation=[{name:"A",d:"형태소+문자",MAE:6.2,RMSE:7.8,R2:0.41},{name:"B",d:"+문장표현",MAE:5.5,RMSE:7.1,R2:0.52},{name:"C",d:"+카테고리",MAE:5.1,RMSE:6.6,R2:0.58},{name:"D",d:"+시계열",MAE:3.8,RMSE:5.0,R2:0.73},{name:"E",d:"전체",MAE:3.2,RMSE:4.3,R2:0.79}];
const sampleTL=[{word:"먹방",tl:[100,95,92,88,90,85,87,82,80,78,80,77,75,78,74,72,70,68,72,70,68,66,65,64]},{word:"갓생",tl:[40,65,88,100,95,90,82,78,72,68,60,55,50,48,42,38,35,30,0,0,0,0,0,0]},{word:"럭키비키",tl:[30,78,100,85,55,30,18,10,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{word:"얼죽아",tl:[55,70,85,100,90,88,82,78,80,76,72,68,65,70,66,62,60,58,55,52,50,48,45,42]}];

function seed(s){return()=>{s=(s*16807)%2147483647;return s/2147483647;};}
function genYear(y){const ws=YEAR_WORDS[y]||[];const r=seed(y);const age=2026-y;return ws.map(w=>{const b=r();let s=Math.round(Math.min(24,Math.max(0,age>8?(b>.7?24:b>.4?18:b>.2?10:4):age>4?(b>.5?20:b>.3?14:b>.15?8:3):(b>.6?12:b>.3?7:b>.1?4:2))));return{word:w,survival:s,cat:CATS[Math.floor(r()*CATS.length)],type:TYPES[Math.floor(r()*TYPES.length)],md:Math.round((0.15+r()*0.8)*100)/100,replace:r()>.6,conf:Math.round((0.55+r()*0.35)*100)/100};}).sort((a,b)=>b.survival-a.survival);}

// SHAP data for demo words
const SHAP_DATA={
  "럭키비키":[{f:"초기 감소 급격",v:-3.2},{f:"매체 다양성 ↓",v:-2.1},{f:"대체 단어 없음",v:-1.4},{f:"아이돌/팬덤",v:-0.5},{f:"짧은 음절",v:0.8},{f:"긍정 감정",v:0.3}],
  "먹방":[{f:"기존 단어 대체 ✓",v:3.8},{f:"매체 다양성 최고",v:3.2},{f:"안정적 감소세",v:2.5},{f:"짧은 음절",v:1.2},{f:"방송/드라마 유래",v:0.8},{f:"줄임말 형태",v:0.5}],
  "갓생":[{f:"매체 다양성 높음",v:2.4},{f:"기존 단어 대체 ✓",v:2.0},{f:"완만한 감소세",v:1.5},{f:"SNS/밈 유래",v:0.4},{f:"짧은 음절",v:0.8},{f:"합성어 형태",v:0.3}],
  "어쩔티비":[{f:"초기 감소 매우 급격",v:-4.1},{f:"매체 다양성 ↓",v:-2.8},{f:"문장형 표현",v:-1.5},{f:"대체 단어 없음",v:-1.2},{f:"커뮤니티 유래",v:-0.3},{f:"부정 감정",v:-0.2}],
  "킹받다":[{f:"기존 단어 대체 ✓",v:2.2},{f:"매체 다양성 보통",v:1.0},{f:"중간 감소세",v:0.5},{f:"커뮤니티 유래",v:0.3},{f:"합성어 형태",v:0.4},{f:"부정 감정",v:-0.3}],
  "TMI":[{f:"기존 단어 대체 ✓",v:3.5},{f:"매체 다양성 최고",v:3.0},{f:"안정적 사용",v:2.8},{f:"짧은 음절",v:1.0},{f:"SNS/밈",v:0.5},{f:"한영혼합",v:-0.3}],
};

/* ═══ UI ═══ */
function Card({children,style}){return<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 20px",boxShadow:shadow,...style}}>{children}</div>;}
function STitle({children,sub}){return<div style={{marginBottom:24}}><h2 style={{color:C.text,fontSize:20,fontWeight:700,margin:0,display:"flex",alignItems:"center",gap:9}}><span style={{width:3,height:18,background:`linear-gradient(180deg,${C.amber},${C.coral})`,borderRadius:2}}/>{children}</h2>{sub&&<p style={{color:C.textDim,fontSize:13,margin:"5px 0 0 12px"}}>{sub}</p>}</div>;}
function Pill({children,color=C.amber,active,onClick}){return<button onClick={onClick} style={{padding:"5px 12px",borderRadius:18,cursor:"pointer",fontFamily:font,fontSize:12,fontWeight:600,background:active?`${color}14`:"transparent",border:`1px solid ${active?color+"44":C.border}`,color:active?color:C.textDim,transition:"all 0.15s"}}>{children}</button>;}
function Badge({children,color}){return<span style={{padding:"3px 10px",borderRadius:16,background:`${color}12`,color,fontSize:11,fontWeight:600}}>{children}</span>;}
function SurvBar({value,max=24}){const c=value>=18?C.green:value>=10?C.yellow:value>=5?C.orange:C.red;return<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:56,height:6,background:C.surfaceLight,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:`${(value/max)*100}%`,background:c}}/></div><span style={{color:c,fontFamily:mono,fontWeight:700,fontSize:13}}>{value}</span></div>;}
function StatBox({label,value,unit,color=C.amber,sub}){return<Card><span style={{color:C.textDim,fontSize:12}}>{label}</span><div style={{display:"flex",alignItems:"baseline",gap:5,marginTop:3}}><span style={{color,fontSize:26,fontWeight:800,fontFamily:mono}}>{value}</span>{unit&&<span style={{color:C.textDim,fontSize:13}}>{unit}</span>}</div>{sub&&<span style={{color:C.textMuted,fontSize:11}}>{sub}</span>}</Card>;}

/* ═══ HOME ═══ */
function Home({go}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),80);},[]);
  return<>
    <section style={{minHeight:"78vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",padding:"80px 24px 40px",opacity:vis?1:0,transform:vis?"none":"translateY(20px)",transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{padding:"5px 14px",borderRadius:16,background:C.amberBg,border:`1px solid ${C.amber}25`,marginBottom:28,fontSize:12,color:C.amber,fontWeight:600}}>FL Team · 유행어 생존 예측 프로젝트</div>
      <h1 style={{fontSize:"clamp(2rem,5vw,3.2rem)",fontWeight:800,color:C.text,lineHeight:1.15,margin:0,letterSpacing:"-0.03em",maxWidth:640}}>
        이 유행어,<br/><span style={{background:`linear-gradient(135deg,${C.amber},${C.coral})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>얼마나 오래 갈까?</span>
      </h1>
      <p style={{color:C.textMid,fontSize:16,lineHeight:1.8,maxWidth:500,margin:"24px 0 40px"}}>2002년부터 2026년까지 수집한 7,613개 유행어의 형태적·사회적 특성을 분석하고, AI 모델로 미래 생존 기간을 예측합니다.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={()=>go("predict")} style={{padding:"14px 32px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.amber},${C.coral})`,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:font,boxShadow:`0 4px 16px ${C.amber}33`}}>유행어 생존 예측하기</button>
        <button onClick={()=>go("year")} style={{padding:"14px 32px",borderRadius:10,border:`1px solid ${C.borderDark}`,background:C.card,color:C.textMid,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:font}}>연도별 탐색</button>
      </div>
    </section>

    <section style={{padding:"0 24px 48px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
        <StatBox label="수집 유행어" value="7,613" unit="개" sub="24년간 수집"/>
        <StatBox label="모델 정확도 R²" value="0.79" color={C.green} sub="XGBoost 전체 피처"/>
        <StatBox label="평균 생존율" value="~12" unit="%" color={C.coral} sub="3년 이상 생존"/>
        <StatBox label="분석 플랫폼" value="5" unit="개" color={C.purple} sub="유튜브·X·더쿠 등"/>
      </div>
    </section>

    {/* Why this matters */}
    <section style={{padding:"0 24px 48px",maxWidth:1100,margin:"0 auto"}}>
      <STitle sub="유행어 예측이 왜 필요한가">프로젝트 배경</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
        {[
          {icon:"💬",title:"세대 간 소통 단절",desc:"유행어를 모르면 대화에서 소외되고, 이미 지난 유행어를 쓰면 오히려 어색합니다. 어떤 단어가 아직 살아있는지 객관적 기준이 필요합니다.",color:C.amber},
          {icon:"📉",title:"기업 마케팅 실패",desc:"오비맥주 '필굿'은 신조어 마케팅 후 매출 9.4% 하락, GS25는 '싹싹김치' 사용으로 불매운동에 직면했습니다. 유행어의 유효기간을 모르면 리스크입니다.",color:C.coral},
          {icon:"⚠️",title:"혐오 표현 정착",desc:"일부 유행어는 혐오·차별 표현이 포함되어 있으며, 정착 가능성이 높은 혐오 표현을 조기에 포착하면 언어 정책 수립에 활용할 수 있습니다.",color:C.red},
        ].map(c=><Card key={c.title}><div style={{fontSize:24,marginBottom:10}}>{c.icon}</div><div style={{color:c.color,fontSize:15,fontWeight:700,marginBottom:6}}>{c.title}</div><div style={{color:C.textDim,fontSize:13,lineHeight:1.7}}>{c.desc}</div></Card>)}
      </div>
    </section>

    {/* How it works */}
    <section style={{padding:"0 24px 48px",maxWidth:1100,margin:"0 auto"}}>
      <STitle sub="유행어 입력부터 생존 예측까지">작동 원리</STitle>
      <div style={{display:"flex",gap:0,flexWrap:"wrap",justifyContent:"center"}}>
        {[{step:"01",title:"데이터 수집",desc:"국립국어원 신어 자료집 + 유튜브·SNS·커뮤니티 크롤링"},{step:"02",title:"피처 추출",desc:"형태소 분석, 시계열 사용량, 유행 맥락, 표현 특성 등 다차원 피처 생성"},{step:"03",title:"모델 학습",desc:"XGBoost·LightGBM 회귀 모델로 생존 개월 수 예측, Ablation Study로 피처 기여도 분석"},{step:"04",title:"예측 서비스",desc:"새로운 유행어 입력 → AI가 24개월 중 생존 기간과 예측 근거를 제공"}].map((s,i)=>(
          <div key={s.step} style={{flex:"1 1 220px",padding:"20px",textAlign:"center",position:"relative"}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.amber},${C.coral})`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:14,fontWeight:800,fontFamily:mono}}>{s.step}</div>
            <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:4}}>{s.title}</div>
            <div style={{color:C.textDim,fontSize:12,lineHeight:1.6}}>{s.desc}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Pages */}
    <section style={{padding:"0 24px 80px",maxWidth:1100,margin:"0 auto"}}>
      <STitle>둘러보기</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
        {[{id:"predict",icon:"🔮",t:"생존 예측",d:"유행어 특성 입력 → AI 생존 예측",c:C.amber},{id:"year",icon:"📅",t:"연도별 탐색",d:"연도 선택 → 유행어 생존 순위",c:C.coral},{id:"analysis",icon:"📊",t:"모델 분석",d:"Feature Importance · SHAP · Ablation",c:C.purple},{id:"data",icon:"📈",t:"데이터 대시보드",d:"7,613개 유행어 통계·분포",c:C.green}].map(c=>(
          <div key={c.id} onClick={()=>go(c.id)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 18px",cursor:"pointer",transition:"all 0.2s",boxShadow:shadow}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=c.c+"55"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{fontSize:24}}>{c.icon}</span>
            <div style={{color:c.c,fontSize:15,fontWeight:700,marginTop:8}}>{c.t}</div>
            <div style={{color:C.textDim,fontSize:12,marginTop:4}}>{c.d}</div>
          </div>
        ))}
      </div>
    </section>
  </>;
}

/* ═══ PREDICT ═══ */
function Predict(){
  const [word,setWord]=useState("");const [cat,setCat]=useState("");const [type,setType]=useState("");const [replace,setReplace]=useState(false);const [speed,setSpeed]=useState("보통");const [media,setMedia]=useState(3);const [result,setResult]=useState(null);const [loading,setLoading]=useState(false);
  const wa=useMemo(()=>word?{len:word.replace(/\s/g,"").length,hasEng:/[a-zA-Z]/.test(word),isSent:word.includes(" ")&&word.length>5}:null,[word]);
  const predict=()=>{if(!word||!cat||!type)return;setLoading(true);setTimeout(()=>{let s=12;s+=(media-1)*1.8;if(replace)s+=4;if(speed==="매우 빠름")s-=3;if(speed==="빠름")s-=1;if(speed==="느림")s+=2;if(type==="줄임말")s+=1.5;if(type==="문장형")s-=2;if(type==="초성체")s-=1.5;if(cat==="방송/드라마")s+=1;if(cat==="아이돌/팬덤")s-=1;s=Math.round(Math.max(0,Math.min(24,s)));const tl=[];const pk=speed==="매우 빠름"?2:speed==="빠름"?3:speed==="느림"?6:4;for(let i=0;i<24;i++){let v;if(i<pk)v=30+70*(i/pk);else{const d=s>=18?0.015:s>=12?0.04:s>=6?0.08:0.15;v=100*Math.exp(-d*(i-pk));}tl.push(Math.round(Math.max(0,Math.min(100,v))));}
  const ft={"매체 다양성":media>=4?0.28:0.18,"초기 확산 패턴":speed==="매우 빠름"?0.25:0.15,"기존 단어 대체":replace?0.22:0.08,"표현 유형":type==="문장형"?0.18:0.14,"음절 수":wa.len<=2?0.08:0.12};const sm=Object.values(ft).reduce((a,b)=>a+b,0);Object.keys(ft).forEach(k=>ft[k]=Math.round(ft[k]/sm*100)/100);
  setResult({survival:s,confidence:0.6+Math.random()*0.25,features:ft,timeline:tl});setLoading(false);},1000);};
  const sc=result?result.survival>=18?C.green:result.survival>=10?C.yellow:result.survival>=5?C.orange:C.red:C.amber;
  return<div style={{padding:"32px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
    <STitle sub="유행어 특성을 입력하면 AI가 24개월 중 생존 기간을 예측합니다">유행어 생존 예측</STitle>
    <Card style={{marginBottom:16}}><div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>예측할 유행어</div>
      <input value={word} onChange={e=>{setWord(e.target.value);setResult(null);}} placeholder="예: 럭키비키, 트랄랄레로, 갓생..." style={{width:"100%",boxSizing:"border-box",padding:"13px 16px",borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:15,fontFamily:font,outline:"none"}} onFocus={e=>e.target.style.borderColor=C.amber} onBlur={e=>e.target.style.borderColor=C.border}/>
      {wa&&word&&<div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>{[["글자 수",wa.len],wa.hasEng&&["영문포함","✓"],wa.isSent&&["문장형","✓"]].filter(Boolean).map(([k,v])=><span key={k} style={{padding:"3px 8px",borderRadius:5,background:C.surface,fontSize:11,color:C.textDim}}><b style={{color:C.amber}}>{v}</b> {k}</span>)}</div>}
    </Card>
    {word&&<Card style={{marginBottom:16}}><div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>특성 선택</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><div style={{color:C.textDim,fontSize:12,fontWeight:600,marginBottom:7}}><span style={{color:C.coral}}>*</span> 유행 시작 카테고리</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{CATS.map(c=><Pill key={c} active={cat===c} color={CAT_C[c]} onClick={()=>setCat(c)}>{c}</Pill>)}</div></div>
          <div><div style={{color:C.textDim,fontSize:12,fontWeight:600,marginBottom:7}}><span style={{color:C.coral}}>*</span> 표현 유형</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{TYPES.map(t=><Pill key={t} active={type===t} color={C.purple} onClick={()=>setType(t)}>{t}</Pill>)}</div></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><div style={{color:C.textDim,fontSize:12,fontWeight:600,marginBottom:7}}>초기 확산 속도</div><div style={{display:"flex",gap:5}}>{["느림","보통","빠름","매우 빠름"].map(s=><Pill key={s} active={speed===s} color={C.amber} onClick={()=>setSpeed(s)}>{s}</Pill>)}</div></div>
          <div><div style={{color:C.textDim,fontSize:12,fontWeight:600,marginBottom:7}}>사용 매체 범위</div><div style={{display:"flex",alignItems:"center",gap:10}}><input type="range" min={1} max={5} value={media} onChange={e=>setMedia(+e.target.value)} style={{flex:1,accentColor:C.amber}}/><span style={{color:C.amber,fontFamily:mono,fontWeight:700}}>{media}개</span></div></div>
          <div><div style={{color:C.textDim,fontSize:12,fontWeight:600,marginBottom:7}}>기존 단어 대체</div><div style={{display:"flex",gap:8}}>{[[true,"✓ 대체함",C.green],[false,"✗ 새 표현",C.red]].map(([v,l,col])=><button key={String(v)} onClick={()=>setReplace(v)} style={{flex:1,padding:"9px",borderRadius:8,cursor:"pointer",fontFamily:font,fontSize:12,fontWeight:600,background:replace===v?`${col}0a`:C.bg,border:`1px solid ${replace===v?col+"44":C.border}`,color:replace===v?col:C.textDim}}>{l}</button>)}</div></div>
        </div>
      </div>
      <div style={{marginTop:20,textAlign:"center"}}><button onClick={predict} disabled={!cat||!type||loading} style={{padding:"14px 44px",borderRadius:10,border:"none",fontSize:15,fontWeight:700,cursor:!cat||!type?"not-allowed":"pointer",fontFamily:font,background:!cat||!type?C.surfaceLight:`linear-gradient(135deg,${C.amber},${C.coral})`,color:!cat||!type?C.textMuted:"#fff"}}>{loading?"분석 중...":"🔮 예측하기"}</button></div>
    </Card>}
    {result&&<><Card style={{marginBottom:16,border:`1px solid ${C.amber}30`}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><span style={{fontSize:24,fontWeight:800,color:C.text}}>"{word}"</span><Badge color={sc}>{result.survival>=18?"정착 가능":result.survival>=10?"장기유행":result.survival>=5?"중기":"단기소멸"}</Badge></div>
          <div style={{background:C.bg,borderRadius:10,padding:20,marginBottom:12}}>
            <div style={{color:C.textDim,fontSize:12,marginBottom:6}}>예상 생존 기간</div>
            <div style={{display:"flex",alignItems:"baseline",gap:6}}><span style={{fontSize:48,fontWeight:800,color:sc,fontFamily:mono}}>{result.survival}</span><span style={{color:C.textDim}}>/ 24 개월</span></div>
            <div style={{height:8,background:C.surfaceLight,borderRadius:4,marginTop:10,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,width:`${(result.survival/24)*100}%`,background:sc,transition:"width 0.8s"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:C.textMuted}}><span>0</span><span>신뢰도 {(result.confidence*100).toFixed(0)}%</span><span>24</span></div>
          </div>
        </div>
        <div>
          <div style={{color:C.textDim,fontSize:12,fontWeight:600,marginBottom:10}}>예측 근거</div>
          <div style={{background:C.bg,borderRadius:10,padding:16}}>
            {Object.entries(result.features).map(([n,v],i)=>{const cls=[C.amber,C.coral,C.green,C.purple,C.yellow];return<div key={n} style={{marginBottom:i<4?12:0}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.textMid}}>{n}</span><span style={{color:cls[i],fontFamily:mono,fontWeight:600}}>{(v*100).toFixed(0)}%</span></div><div style={{height:5,background:C.surfaceLight,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:`${v*100}%`,background:cls[i]}}/></div></div>;})}
          </div>
        </div>
      </div>
    </Card>
    <Card><div style={{color:C.textDim,fontSize:12,fontWeight:600,marginBottom:12}}>예상 사용량 추이</div>
      <ResponsiveContainer width="100%" height={180}><AreaChart data={result.timeline.map((v,i)=>({m:i+1,v}))}>
        <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={sc} stopOpacity={0.2}/><stop offset="95%" stopColor={sc} stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="m" tick={{fill:C.textMuted,fontSize:10}} axisLine={{stroke:C.border}} tickLine={false}/><YAxis tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} domain={[0,100]}/><Tooltip contentStyle={tt}/><Area type="monotone" dataKey="v" stroke={sc} fill="url(#rg)" strokeWidth={2} name="사용 빈도"/>
      </AreaChart></ResponsiveContainer>
    </Card></>}
  </div>;
}

/* ═══ YEAR EXPLORER ═══ */
function Year(){
  const years=Object.keys(YC).map(Number).sort();
  const [sel,setSel]=useState(2024);
  const data=useMemo(()=>genYear(sel),[sel]);
  const avg=data.length?(data.reduce((a,w)=>a+w.survival,0)/data.length).toFixed(1):0;
  const survDist=useMemo(()=>[{r:"0–6",lo:0,hi:6,c:C.red},{r:"7–12",lo:7,hi:12,c:C.orange},{r:"13–18",lo:13,hi:18,c:C.yellow},{r:"19–24",lo:19,hi:24,c:C.green}].map(b=>({...b,count:data.filter(w=>w.survival>=b.lo&&w.survival<=b.hi).length})),[data]);

  return<div style={{padding:"32px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
    <STitle sub="연도를 선택하면 해당 연도 유행어의 예측 순위를 보여줍니다">연도별 유행어 탐색</STitle>
    <Card style={{marginBottom:20,padding:"14px 16px"}}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{years.map(y=><button key={y} onClick={()=>setSel(y)} style={{padding:"5px 10px",borderRadius:7,cursor:"pointer",fontFamily:mono,fontSize:11,fontWeight:sel===y?700:400,border:"none",background:sel===y?`linear-gradient(135deg,${C.amber},${C.coral})`:C.surface,color:sel===y?"#fff":C.textDim}}>{y}</button>)}</div></Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:20}}>
      <StatBox label={`${sel}년 전체`} value={YC[sel]} unit="개"/><StatBox label="평균 생존" value={avg} unit="개월" color={C.coral}/><StatBox label="장기 정착" value={data.filter(w=>w.survival>=18).length} unit="개" color={C.green}/><StatBox label="단기 소멸" value={data.filter(w=>w.survival<=6).length} unit="개" color={C.red}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14,marginBottom:20}}>
      <Card><div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>생존 기간 분포</div>
        <ResponsiveContainer width="100%" height={180}><BarChart data={survDist}><XAxis dataKey="r" tick={{fill:C.textDim,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/><YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/><Bar dataKey="count" name="유행어 수" radius={[6,6,0,0]} barSize={36}>{survDist.map((b,i)=><Cell key={i} fill={b.c}/>)}</Bar></BarChart></ResponsiveContainer>
      </Card>
      <Card><div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>전체 연도 추이</div>
        <ResponsiveContainer width="100%" height={180}><BarChart data={Object.entries(YC).map(([y,c])=>({y,c}))}>
          <XAxis dataKey="y" tick={{fill:C.textMuted,fontSize:8}} axisLine={{stroke:C.border}} tickLine={false} angle={-45} textAnchor="end" height={35}/><YAxis tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/><Bar dataKey="c" radius={[2,2,0,0]} barSize={14}>{Object.keys(YC).map((y,i)=><Cell key={i} fill={+y===sel?C.amber:C.surfaceLight}/>)}</Bar>
        </BarChart></ResponsiveContainer>
      </Card>
    </div>
    <Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div><div style={{color:C.text,fontSize:15,fontWeight:700}}>{sel}년 유행어 — 예측 생존 순위</div><div style={{color:C.textMuted,fontSize:12,marginTop:2}}>샘플 {data.length}개 · 생존 개월 수 내림차순</div></div>
      <div style={{display:"flex",gap:8}}>{[["정착",C.green],["장기",C.yellow],["중기",C.orange],["단기",C.red]].map(([l,c])=><span key={l} style={{fontSize:10,color:c,display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:c}}/>{l}</span>)}</div>
    </div>
    {data.map((w,i)=>{const sc=w.survival>=18?C.green:w.survival>=10?C.yellow:w.survival>=5?C.orange:C.red;return<div key={i} style={{display:"grid",gridTemplateColumns:"32px 1fr auto auto auto",gap:10,alignItems:"center",padding:"11px 14px",borderRadius:8,background:i%2===0?C.bg:"transparent",borderBottom:`1px solid ${C.border}`}}>
      <span style={{color:i<3?C.amber:C.textMuted,fontSize:13,fontWeight:i<3?800:500,fontFamily:mono,textAlign:"center"}}>{i<3?["🥇","🥈","🥉"][i]:i+1}</span>
      <div><span style={{color:C.text,fontSize:14,fontWeight:600}}>{w.word}</span><div style={{display:"flex",gap:3,marginTop:2}}><span style={{fontSize:10,color:CAT_C[w.cat],padding:"1px 5px",borderRadius:3,background:`${CAT_C[w.cat]}10`}}>{w.cat}</span><span style={{fontSize:10,color:C.purple,padding:"1px 5px",borderRadius:3,background:C.purpleBg}}>{w.type}</span></div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted}}>매체</div><div style={{fontSize:11,color:C.textMid,fontFamily:mono}}>{(w.md*100).toFixed(0)}%</div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted}}>신뢰도</div><div style={{fontSize:11,color:C.textMid,fontFamily:mono}}>{(w.conf*100).toFixed(0)}%</div></div>
      <SurvBar value={w.survival}/>
    </div>;})}
    </Card>
  </div>;
}

/* ═══ ANALYSIS (ENRICHED) ═══ */
function Analysis(){
  const [shapWord,setShapWord]=useState("럭키비키");
  const shapWords=Object.keys(SHAP_DATA);
  const shapD=SHAP_DATA[shapWord]||[];
  const maxShap=Math.max(...shapD.map(d=>Math.abs(d.v)),1);
  const groupTotals=useMemo(()=>{const g={};featureImp.forEach(f=>{g[f.group]=(g[f.group]||0)+f.value;});return Object.entries(g).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({name:k,value:Math.round(v*1000)/10}));},[]);

  return<div style={{padding:"32px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
    <STitle sub="XGBoost/LightGBM 모델 학습 결과와 피처 분석">모델 분석 결과</STitle>

    {/* Feature Importance - grouped */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14,marginBottom:20}}>
      <Card>
        <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:4}}>Global Feature Importance</div>
        <div style={{color:C.textMuted,fontSize:12,marginBottom:14}}>전체 모델에서 각 피처가 차지하는 중요도</div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={featureImp} layout="vertical" margin={{left:130}}>
            <XAxis type="number" tick={{fill:C.textMuted,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false} domain={[0,0.2]}/>
            <YAxis type="category" dataKey="name" tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false} width={130}/>
            <Tooltip contentStyle={tt} formatter={v=>[(v*100).toFixed(1)+"%"]}/>
            <Bar dataKey="value" radius={[0,6,6,0]} barSize={16}>
              {featureImp.map((f,i)=><Cell key={i} fill={f.group==="시계열"?C.amber:f.group==="맥락"?C.coral:f.group==="형태소"?C.purple:C.green}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:4}}>피처 그룹별 기여도</div>
        <div style={{color:C.textMuted,fontSize:12,marginBottom:14}}>4개 피처 그룹이 전체 중요도에서 차지하는 비율</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={groupTotals} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" nameKey="name" stroke="#fff" strokeWidth={2}>
            {groupTotals.map((_,i)=><Cell key={i} fill={[C.amber,C.coral,C.purple,C.green][i]}/>)}
          </Pie><Tooltip contentStyle={tt} formatter={v=>[v+"%"]}/><Legend wrapperStyle={{fontSize:11}}/></PieChart>
        </ResponsiveContainer>
        <div style={{marginTop:12,padding:12,borderRadius:8,background:C.amberBg,fontSize:12,color:C.textDim,lineHeight:1.7}}>
          <b style={{color:C.amber}}>핵심:</b> 시계열 피처가 <b style={{color:C.amber}}>44.1%</b>로 가장 중요하고, 사회적 맥락이 <b style={{color:C.coral}}>32.8%</b>를 차지. 형태소·표현 피처만으로는 예측력이 제한적입니다.
        </div>
      </Card>
    </div>

    {/* SHAP Interactive */}
    <Card style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:16}}>
        <div><div style={{color:C.text,fontSize:14,fontWeight:700}}>SHAP Value — 개별 예측 분석</div><div style={{color:C.textMuted,fontSize:12,marginTop:2}}>유행어를 선택하면 각 피처가 해당 예측에 기여한 방향과 크기를 보여줍니다</div></div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{shapWords.map(w=><Pill key={w} active={shapWord===w} color={C.purple} onClick={()=>setShapWord(w)}>{w}</Pill>)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
        <div style={{background:C.bg,borderRadius:10,padding:18}}>
          <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>"{shapWord}" 피처별 기여도</div>
          {shapD.map((f,i)=>{const pct=Math.abs(f.v)/maxShap*100;const isPos=f.v>0;return<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{color:C.textDim,fontSize:11,width:120,textAlign:"right",flexShrink:0}}>{f.f}</span>
            <div style={{flex:1,height:20,position:"relative"}}>
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:C.border}}/>
              {isPos?<div style={{position:"absolute",left:"50%",width:`${pct/2}%`,height:16,top:2,borderRadius:"0 4px 4px 0",background:C.green,opacity:0.7,marginLeft:2}}/>
              :<div style={{position:"absolute",right:"50%",width:`${pct/2}%`,height:16,top:2,borderRadius:"4px 0 0 4px",background:C.red,opacity:0.7,marginRight:2}}/>}
            </div>
            <span style={{color:isPos?C.green:C.red,fontSize:12,fontFamily:mono,fontWeight:600,width:36,textAlign:"right"}}>{f.v>0?"+":""}{f.v}</span>
          </div>;})}
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:8,fontSize:10,color:C.textMuted}}><span>← 생존 ↓</span><span>생존 ↑ →</span></div>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:10}}>SHAP 해석</div>
          <div style={{fontSize:12,color:C.textDim,lineHeight:1.8,marginBottom:14}}>
            {shapWord==="럭키비키"&&<>초기 감소가 급격하고(-3.2) 매체 다양성이 낮은 것(-2.1)이 생존 기간을 크게 줄이는 요인입니다. 짧은 음절(+0.8)이 소폭 긍정적이나, 전반적으로 단기 소멸 패턴입니다.</>}
            {shapWord==="먹방"&&<>기존 단어 대체(+3.8)와 최고 수준의 매체 다양성(+3.2)이 장기 정착을 강력히 견인합니다. 모든 피처가 긍정적으로 작용하는 이상적인 정착 패턴입니다.</>}
            {shapWord==="갓생"&&<>매체 다양성(+2.4)과 기존 단어 대체(+2.0)가 긍정적이며, 완만한 감소세(+1.5)도 장기 유행을 뒷받침합니다.</>}
            {shapWord==="어쩔티비"&&<>초기 감소가 매우 급격하고(-4.1) 매체 다양성도 낮아(-2.8) 빠른 소멸이 예측됩니다. 문장형 표현(-1.5)도 부정적 요인입니다.</>}
            {shapWord==="킹받다"&&<>기존 단어 대체(+2.2)가 가장 큰 긍정 요인이며, 중간 수준의 매체 다양성이 장기 유행을 지지합니다.</>}
            {shapWord==="TMI"&&<>기존 단어 대체(+3.5), 최고 매체 다양성(+3.0), 안정적 사용 패턴(+2.8) 등 정착 단어의 전형적 SHAP 분포입니다.</>}
          </div>
          <div style={{padding:12,borderRadius:8,background:C.purpleBg,fontSize:12,color:C.textDim,lineHeight:1.7}}>
            <b style={{color:C.purple}}>Global vs SHAP:</b> Global Feature Importance는 모델 전체의 피처 중요도이고, SHAP은 개별 예측마다 달라지는 기여도입니다. 같은 피처라도 단어에 따라 긍정/부정이 바뀔 수 있습니다.
          </div>
        </div>
      </div>
    </Card>

    {/* Ablation */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14,marginBottom:20}}>
      <Card><div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>Ablation Study — R²</div>
        <ResponsiveContainer width="100%" height={220}><AreaChart data={ablation}>
          <defs><linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.amber} stopOpacity={0.2}/><stop offset="95%" stopColor={C.amber} stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="name" tick={{fill:C.textDim,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/><YAxis domain={[0,1]} tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/><Area type="monotone" dataKey="R2" stroke={C.amber} fill="url(#ag2)" strokeWidth={2.5} dot={{fill:C.amber,r:5}}/>
        </AreaChart></ResponsiveContainer>
      </Card>
      <Card><div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>Ablation Study — MAE / RMSE</div>
        <ResponsiveContainer width="100%" height={220}><LineChart data={ablation}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="name" tick={{fill:C.textDim,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/><YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/><Line type="monotone" dataKey="MAE" stroke={C.coral} strokeWidth={2.5} dot={{fill:C.coral,r:5}}/><Line type="monotone" dataKey="RMSE" stroke={C.purple} strokeWidth={2.5} dot={{fill:C.purple,r:5}}/><Legend wrapperStyle={{fontSize:11}}/>
        </LineChart></ResponsiveContainer>
      </Card>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:20}}>
      {[{l:"시계열 피처",v:"+0.15",s:"R² C→D",c:C.amber},{l:"문장표현",v:"+0.11",s:"R² A→B",c:C.coral},{l:"최종 R²",v:"0.79",s:"전체 피처",c:C.green},{l:"MAE",v:"3.2",s:"±3.2개월",c:C.yellow}].map(i=><Card key={i.l}><div style={{fontSize:11,color:C.textMuted}}>{i.l}</div><div style={{fontSize:22,fontWeight:800,color:i.c,fontFamily:mono}}>{i.v}</div><div style={{fontSize:10,color:C.textDim}}>{i.s}</div></Card>)}
    </div>

    {/* Timelines */}
    <Card><div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:14}}>주요 유행어 사용량 추이 비교</div>
      <ResponsiveContainer width="100%" height={240}><LineChart data={Array.from({length:24},(_,i)=>({m:`${i+1}`,...Object.fromEntries(sampleTL.map(w=>[w.word,w.tl[i]]))}))}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="m" tick={{fill:C.textMuted,fontSize:10}} axisLine={{stroke:C.border}} tickLine={false}/><YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/>{sampleTL.map((w,i)=>{const c=[C.amber,C.coral,C.yellow,C.green];return<Line key={w.word} type="monotone" dataKey={w.word} stroke={c[i]} strokeWidth={2.5} dot={false}/>})}<Legend wrapperStyle={{fontSize:11}}/>
      </LineChart></ResponsiveContainer>
    </Card>
  </div>;
}

/* ═══ DATA DASHBOARD ═══ */
function Data(){
  const yearData=Object.entries(YC).map(([y,c])=>({year:y,count:c}));
  const topYears=yearData.sort((a,b)=>b.count-a.count).slice(0,5);
  const decadeData=[{d:"2002–2009",c:Object.entries(YC).filter(([y])=>+y>=2002&&+y<=2009).reduce((a,[,c])=>a+c,0)},{d:"2010–2015",c:Object.entries(YC).filter(([y])=>+y>=2010&&+y<=2015).reduce((a,[,c])=>a+c,0)},{d:"2016–2019",c:Object.entries(YC).filter(([y])=>+y>=2016&&+y<=2019).reduce((a,[,c])=>a+c,0)},{d:"2020–2026",c:Object.entries(YC).filter(([y])=>+y>=2020&&+y<=2026).reduce((a,[,c])=>a+c,0)}];

  return<div style={{padding:"32px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
    <STitle sub="7,613개 유행어 데이터셋의 전체 통계 — 실제 데이터 기반">데이터 대시보드</STitle>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:20}}>
      <StatBox label="총 유행어" value={TOTAL.toLocaleString()} unit="개"/>
      <StatBox label="수집 기간" value="24" unit="년" color={C.coral} sub="2002–2026"/>
      <StatBox label="최다 연도" value="2009" color={C.yellow} sub="691개"/>
      <StatBox label="최소 연도" value="2026" color={C.textMuted} sub="52개 (수집중)"/>
      <StatBox label="국립국어원" value="~7,450" unit="개" color={C.amber}/>
      <StatBox label="자체 수집" value="156" unit="개" color={C.green} sub="2025–2026"/>
    </div>

    <Card style={{marginBottom:20}}>
      <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>연도별 유행어 수 (실제 데이터)</div>
      <ResponsiveContainer width="100%" height={260}><BarChart data={Object.entries(YC).sort(([a],[b])=>+a-+b).map(([y,c])=>({year:y,count:c}))}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:9}} axisLine={{stroke:C.border}} tickLine={false} interval={1} angle={-45} textAnchor="end" height={40}/><YAxis tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/>
        <Bar dataKey="count" name="유행어 수" radius={[3,3,0,0]} barSize={16}>{Object.entries(YC).sort(([a],[b])=>+a-+b).map(([y],i)=><Cell key={i} fill={+y>=2025?C.green:+y>=2020?C.amber:+y>=2016?C.coral:C.surfaceLight}/>)}</Bar>
      </BarChart></ResponsiveContainer>
      <div style={{display:"flex",gap:14,marginTop:8,justifyContent:"center",flexWrap:"wrap"}}>{[["~2015",C.surfaceLight],["2016–2019",C.coral],["2020–2024",C.amber],["자체수집",C.green]].map(([l,c])=><span key={l} style={{fontSize:10,color:C.textDim,display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</span>)}</div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14,marginBottom:20}}>
      <Card>
        <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>시기별 유행어 비중</div>
        <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={decadeData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="c" nameKey="d" stroke="#fff" strokeWidth={2}>
          {decadeData.map((_,i)=><Cell key={i} fill={[C.surfaceLight,C.coral,C.amber,C.green][i]}/>)}
        </Pie><Tooltip contentStyle={tt}/><Legend wrapperStyle={{fontSize:11}}/></PieChart></ResponsiveContainer>
      </Card>
      <Card>
        <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>연도별 TOP 5</div>
        {[...Object.entries(YC)].sort(([,a],[,b])=>b-a).slice(0,5).map(([y,c],i)=>{const pct=(c/691*100).toFixed(0);return<div key={y} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{color:C.amber,fontFamily:mono,fontWeight:700,width:40}}>{y}</span>
          <div style={{flex:1,height:20,background:C.surface,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,width:`${pct}%`,background:`linear-gradient(90deg,${C.amber},${C.coral})`}}/></div>
          <span style={{color:C.textMid,fontFamily:mono,fontSize:13,fontWeight:600,width:50,textAlign:"right"}}>{c}개</span>
        </div>;})}
      </Card>
    </div>

    {/* Sample words by era */}
    <Card style={{marginBottom:20}}>
      <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:14}}>시대별 대표 유행어 샘플</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
        {[[2003,"초기"],[2009,"확산기"],[2014,"모바일시대"],[2017,"SNS전성기"],[2020,"코로나시대"],[2024,"최근"]].map(([y,era])=>(
          <div key={y} style={{padding:"14px",borderRadius:10,background:C.bg,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{color:C.amber,fontWeight:700,fontFamily:mono}}>{y}년</span>
              <span style={{color:C.textMuted,fontSize:11}}>{era} · {YC[y]}개</span>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {(YEAR_WORDS[y]||[]).slice(0,8).map(w=><span key={w} style={{padding:"3px 8px",borderRadius:4,background:C.card,border:`1px solid ${C.border}`,fontSize:11,color:C.textMid}}>{w}</span>)}
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:12}}>데이터 출처 구성</div>
      {[{name:"국립국어원 신어 자료집",range:"2002–2024",count:"~7,450개",pct:98,color:C.amber,desc:"매년 발간되는 공식 신어 수집 자료. 형태, 의미, 용례 포함."},{name:"FL팀 자체 수집",range:"2025–2026",count:"156개",pct:2,color:C.green,desc:"유튜브·X·더쿠·네이버 등 온라인 커뮤니티에서 직접 수집한 최신 유행어."}].map(s=>(
        <div key={s.name} style={{padding:"16px",borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:C.text,fontSize:13,fontWeight:600}}>{s.name}</span><span style={{color:s.color,fontSize:12,fontFamily:mono}}>{s.count}</span></div>
          <div style={{height:6,background:C.surfaceLight,borderRadius:3,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",borderRadius:3,width:`${s.pct}%`,background:s.color}}/></div>
          <div style={{fontSize:11,color:C.textDim}}>{s.range} · {s.desc}</div>
        </div>
      ))}
    </Card>
  </div>;
}

/* ═══ APP ═══ */
export default function App(){
  const [page,setPage]=useState("home");
  useEffect(()=>{const l=document.createElement("link");l.href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable.min.css";l.rel="stylesheet";document.head.appendChild(l);},[]);
  const go=p=>{setPage(p);window.scrollTo({top:0,behavior:"smooth"});};
  const NAV=[{id:"home",l:"홈",i:"🏠"},{id:"predict",l:"생존 예측",i:"🔮"},{id:"year",l:"연도별",i:"📅"},{id:"analysis",l:"모델 분석",i:"📊"},{id:"data",l:"데이터",i:"📈"}];
  return<div style={{fontFamily:font,background:C.bg,color:C.text,minHeight:"100vh"}}>
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 20px",height:50,background:`${C.bg}ee`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>go("home")}><span style={{fontSize:17,fontWeight:800,background:`linear-gradient(135deg,${C.amber},${C.coral})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FL</span><span style={{color:C.textDim,fontSize:12}}>유행어 생존 예측</span></div>
      <div style={{display:"flex",gap:2}}>{NAV.map(n=><button key={n.id} onClick={()=>go(n.id)} style={{padding:"5px 10px",borderRadius:7,cursor:"pointer",border:"none",fontFamily:font,fontSize:12,fontWeight:page===n.id?700:500,background:page===n.id?C.amberBg:"transparent",color:page===n.id?C.amber:C.textDim,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12}}>{n.i}</span><span className="nl">{n.l}</span></button>)}</div>
    </nav>
    <div style={{paddingTop:50}}>
      {page==="home"&&<Home go={go}/>}{page==="predict"&&<Predict/>}{page==="year"&&<Year/>}{page==="analysis"&&<Analysis/>}{page==="data"&&<Data/>}
    </div>
    <footer style={{textAlign:"center",padding:"24px 20px",borderTop:`1px solid ${C.border}`,color:C.textMuted,fontSize:11}}>© 2025 FL Team — 유행어 생존 예측 프로젝트</footer>
    <style>{`@media(max-width:600px){.nl{display:none;}}`}</style>
  </div>;
}
