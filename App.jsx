import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
  AreaChart, Area, ComposedChart, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";

const C={
  bg:"#f7f5f0",bgAlt:"#efece5",card:"#ffffff",cardHov:"#fdfcfa",
  surface:"#f0ede6",surfaceLight:"#e8e4dc",
  border:"#e0dbd2",borderDark:"#ccc6ba",
  text:"#1a1612",textMid:"#4a4540",textDim:"#7a746a",textMuted:"#a9a29a",
  amber:"#d4890a",amberLight:"#f5a623",amberBg:"rgba(212,137,10,0.07)",
  coral:"#d94f30",coralBg:"rgba(217,79,48,0.06)",
  purple:"#7c5cbf",purpleBg:"rgba(124,92,191,0.06)",
  green:"#2d9a5a",greenBg:"rgba(45,154,90,0.06)",
  red:"#c93c3c",redBg:"rgba(201,60,60,0.06)",
  yellow:"#b8860b",blue:"#3572b0",orange:"#c66a1e",
};
const font=`'Pretendard Variable','Noto Sans KR',-apple-system,sans-serif`;
const mono=`'JetBrains Mono','Fira Code',monospace`;
const shadow="0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.03)";
const tt={background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12,boxShadow:shadow};

/* ═══ REAL DATA ═══ */
const modelComp=[
  {name:"XGBoost",auroc:1.000,bal:1.000},{name:"CatBoost",auroc:1.000,bal:0.984},
  {name:"Random Forest",auroc:1.000,bal:0.935},{name:"LightGBM",auroc:1.000,bal:0.919},
  {name:"Logistic Reg.",auroc:0.943,bal:0.872},{name:"MLP",auroc:0.914,bal:0.820},
];
const ablationData=[
  {name:"F only",feat:"빈도만",samples:730,count:38,auroc:1.000},
  {name:"E+F",feat:"임베딩+빈도",samples:730,count:422,auroc:1.000},
  {name:"L+F",feat:"언어학+빈도",samples:730,count:103,auroc:1.000},
  {name:"E+L+F",feat:"전체",samples:730,count:487,auroc:1.000},
  {name:"E+L",feat:"텍스트 전용",samples:819,count:449,auroc:0.725},
  {name:"E only",feat:"임베딩만",samples:819,count:384,auroc:0.711},
  {name:"L only",feat:"언어학만",samples:819,count:65,auroc:0.706},
];
const horizonData=[
  {name:"텍스트만",desc:"E+L",samples:819,auroc:0.725,f1:0.544,bal:0.657},
  {name:"h1 (1개월)",desc:"E+L+F(m1)",samples:819,auroc:0.871,f1:0.673,bal:0.785},
  {name:"h3 (3개월)",desc:"E+L+F(m1~3)",samples:788,auroc:0.953,f1:0.787,bal:0.878},
  {name:"h6 (6개월)",desc:"E+L+F(m1~6)",samples:767,auroc:0.998,f1:0.971,bal:0.988},
  {name:"h12 (12개월)",desc:"E+L+F(m1~12)",samples:730,auroc:1.000,f1:0.912,bal:0.919},
];
const shapData=[
  {name:"h12_freq_late_mean",val:8.20,group:"F"},{name:"h12_freq_min",val:1.62,group:"F"},
  {name:"h12_freq_last",val:1.10,group:"F"},{name:"emb_129",val:0.18,group:"E"},
  {name:"h12_freq_sum",val:0.15,group:"F"},{name:"hangul_ratio",val:0.12,group:"L"},
  {name:"emb_175",val:0.10,group:"E"},{name:"h12_freq_first",val:0.09,group:"F"},
  {name:"emb_117",val:0.08,group:"E"},{name:"emb_352",val:0.07,group:"E"},
];
const kdData=[
  {name:"Full Teacher",desc:"LightGBM (E+L+F)",auroc:1.000,bal:0.919},
  {name:"Baseline",desc:"MLP (E+L), α=0",auroc:0.684,bal:0.645},
  {name:"α=0.1",desc:"Distilled",auroc:0.680,bal:0.626},
  {name:"α=0.3",desc:"Distilled",auroc:0.688,bal:0.661},
  {name:"α=0.5",desc:"Distilled",auroc:0.670,bal:0.629},
  {name:"α=0.7",desc:"Distilled",auroc:0.684,bal:0.626},
  {name:"α=1.0",desc:"Distilled",auroc:0.691,bal:0.613},
];
const groupImp=[{name:"Embedding (E)",val:0.01,color:C.purple},{name:"Linguistic (L)",val:0.02,color:C.amber},{name:"Frequency (F)",val:0.53,color:C.coral}];
const YC={2018:120,2019:95,2020:88,2021:110,2022:130,2023:105,2024:140,2025:96,2026:81};

/* ═══ UI ═══ */
function Card({children,style}){return<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 20px",boxShadow:shadow,...style}}>{children}</div>;}
function STitle({children,sub}){return<div style={{marginBottom:24}}><h2 style={{color:C.text,fontSize:20,fontWeight:700,margin:0,display:"flex",alignItems:"center",gap:9}}><span style={{width:3,height:18,background:`linear-gradient(180deg,${C.amber},${C.coral})`,borderRadius:2}}/>{children}</h2>{sub&&<p style={{color:C.textDim,fontSize:13,margin:"5px 0 0 12px"}}>{sub}</p>}</div>;}
function Pill({children,color=C.amber,active,onClick}){return<button onClick={onClick} style={{padding:"5px 12px",borderRadius:18,cursor:"pointer",fontFamily:font,fontSize:12,fontWeight:600,background:active?`${color}14`:"transparent",border:`1px solid ${active?color+"44":C.border}`,color:active?color:C.textDim,transition:"all 0.15s"}}>{children}</button>;}
function Badge({children,color}){return<span style={{padding:"3px 10px",borderRadius:16,background:`${color}12`,color,fontSize:11,fontWeight:600}}>{children}</span>;}
function StatBox({label,value,unit,color=C.amber,sub}){return<Card><span style={{color:C.textDim,fontSize:12}}>{label}</span><div style={{display:"flex",alignItems:"baseline",gap:5,marginTop:3}}><span style={{color,fontSize:26,fontWeight:800,fontFamily:mono}}>{value}</span>{unit&&<span style={{color:C.textDim,fontSize:13}}>{unit}</span>}</div>{sub&&<span style={{color:C.textMuted,fontSize:11}}>{sub}</span>}</Card>;}
function ChartCard({title,sub,children,style}){return<Card style={style}><div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:sub?4:12}}>{title}</div>{sub&&<div style={{color:C.textMuted,fontSize:12,marginBottom:12}}>{sub}</div>}{children}</Card>;}
function Insight({color=C.amber,children}){return<div style={{padding:12,borderRadius:8,background:`${color}08`,border:`1px solid ${color}18`,fontSize:12,color:C.textDim,lineHeight:1.7}}>{children}</div>;}

/* ═══ HOME ═══ */
function Home({go}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),80);},[]);
  return<>
    <section style={{minHeight:"78vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",padding:"80px 24px 40px",opacity:vis?1:0,transform:vis?"none":"translateY(20px)",transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{padding:"5px 14px",borderRadius:16,background:C.amberBg,border:`1px solid ${C.amber}25`,marginBottom:28,fontSize:12,color:C.amber,fontWeight:600}}>FL Team · 유행어 생존 예측 프로젝트</div>
      <h1 style={{fontSize:"clamp(2rem,5vw,3.2rem)",fontWeight:800,color:C.text,lineHeight:1.15,margin:0,letterSpacing:"-0.03em",maxWidth:640}}>
        이 유행어,<br/><span style={{background:`linear-gradient(135deg,${C.amber},${C.coral})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>살아남을 수 있을까?</span>
      </h1>
      <p style={{color:C.textMid,fontSize:16,lineHeight:1.8,maxWidth:520,margin:"24px 0 40px"}}>
        819개 유행어의 트위터 빈도 데이터와 언어학적 특성을 분석하고,<br/>AI 모델로 장기 생존 여부를 예측합니다.
      </p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={()=>go("predict")} style={{padding:"14px 32px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.amber},${C.coral})`,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:font,boxShadow:`0 4px 16px ${C.amber}33`}}>유행어 생존 예측하기</button>
        <button onClick={()=>go("analysis")} style={{padding:"14px 32px",borderRadius:10,border:`1px solid ${C.borderDark}`,background:C.card,color:C.textMid,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:font}}>실험 결과 보기</button>
      </div>
    </section>

    <section style={{padding:"0 24px 48px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
        <StatBox label="학습 데이터" value="819" unit="개" sub="2018–2026 트위터 기반"/>
        <StatBox label="최고 AUROC" value="1.000" color={C.green} sub="XGBoost · E+L+F (h12)"/>
        <StatBox label="텍스트만 AUROC" value="0.725" color={C.coral} sub="E+L · 빈도 없이"/>
        <StatBox label="3개월 예측" value="0.953" color={C.purple} sub="h3 · 실용적 조기예측"/>
      </div>
    </section>

    <section style={{padding:"0 24px 48px",maxWidth:1100,margin:"0 auto"}}>
      <STitle sub="유행어 예측이 왜 필요한가">프로젝트 배경</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14}}>
        {[
          {icon:"💬",title:"세대 간 소통 단절",desc:"유행어를 모르면 대화에서 소외되고, 지난 유행어를 쓰면 어색합니다. 어떤 단어가 살아남을지 객관적 기준이 필요합니다.",color:C.amber},
          {icon:"📉",title:"기업 마케팅 실패",desc:"오비맥주 '필굿'은 신조어 마케팅 후 매출 9.4% 하락. GS25는 '싹싹김치'로 불매운동에 직면. 유행어의 유효기간을 모르면 리스크입니다.",color:C.coral},
          {icon:"⚠️",title:"혐오 표현 정착",desc:"일부 유행어에 혐오·차별 표현이 포함됩니다. 정착 가능성이 높은 혐오 표현을 조기에 포착하면 언어 정책 수립에 활용할 수 있습니다.",color:C.red},
        ].map(c=><Card key={c.title}><div style={{fontSize:24,marginBottom:10}}>{c.icon}</div><div style={{color:c.color,fontSize:15,fontWeight:700,marginBottom:6}}>{c.title}</div><div style={{color:C.textDim,fontSize:13,lineHeight:1.7}}>{c.desc}</div></Card>)}
      </div>
    </section>

    <section style={{padding:"0 24px 48px",maxWidth:1100,margin:"0 auto"}}>
      <STitle sub="핵심 실험 결과 미리보기">Horizon 실험 — 데이터 축적에 따른 예측력 변화</STitle>
      <Card>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={horizonData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="name" tick={{fill:C.textDim,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/>
            <YAxis domain={[0.5,1.05]} tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Area type="monotone" dataKey="auroc" fill={`${C.amber}15`} stroke={C.amber} strokeWidth={2.5} dot={{fill:C.amber,r:6,strokeWidth:2,stroke:"#fff"}} name="AUROC"/>
            <Line type="monotone" dataKey="f1" stroke={C.coral} strokeWidth={2} strokeDasharray="5 5" dot={{fill:C.coral,r:4}} name="F1"/>
          </ComposedChart>
        </ResponsiveContainer>
        <Insight color={C.amber}>
          <b style={{color:C.amber}}>핵심:</b> 텍스트만으로 AUROC 0.725 → <b style={{color:C.amber}}>1개월 데이터 추가 시 0.871</b>(+0.146, 최대 단일 개선) → 3개월이면 0.953으로 실용적 조기 예측 가능 → 6개월이면 사실상 완벽(0.998).
        </Insight>
      </Card>
    </section>

    <section style={{padding:"0 24px 80px",maxWidth:1100,margin:"0 auto"}}>
      <STitle>둘러보기</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
        {[{id:"predict",icon:"🔮",t:"생존 예측",d:"유행어 입력 → AI 장기생존 여부 예측",c:C.amber},{id:"analysis",t:"실험 결과",icon:"📊",d:"5가지 실험 · SHAP · Ablation · KD",c:C.purple},{id:"data",icon:"📈",t:"데이터 & 피처",d:"819개 데이터셋 · 3가지 피처 그룹",c:C.green}].map(c=>(
          <div key={c.id} onClick={()=>go(c.id)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 18px",cursor:"pointer",boxShadow:shadow}} onMouseEnter={e=>e.currentTarget.style.borderColor=c.c+"55"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{fontSize:24}}>{c.icon}</span><div style={{color:c.c,fontSize:15,fontWeight:700,marginTop:8}}>{c.t}</div><div style={{color:C.textDim,fontSize:12,marginTop:4}}>{c.d}</div>
          </div>
        ))}
      </div>
    </section>
  </>;
}

/* ═══ PREDICT (simplified: text only → binary 0/1) ═══ */
function Predict(){
  const [word,setWord]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  const wa=useMemo(()=>{
    if(!word) return null;
    const w=word.trim(),len=w.replace(/\s/g,"").length;
    const hangul=(w.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g)||[]).length;
    const eng=(w.match(/[a-zA-Z]/g)||[]).length;
    const tokens=w.split(/\s+/).length;
    const hasCho=/[ㄱ-ㅎ]/.test(w);
    const hasRepeat=/(.)\1{2,}/.test(w);
    return {len,hangulRatio:len?Math.round(hangul/len*100):0,engRatio:len?Math.round(eng/len*100):0,tokens,hasCho,hasRepeat,isWord:tokens===1&&len<=10,isSent:tokens>=3,syllables:hangul};
  },[word]);

  const predict=()=>{
    if(!word.trim()) return;
    setLoading(true);
    setTimeout(()=>{
      // Mock prediction — will be replaced with actual model
      const w=word.trim();
      const h=[...w].reduce((a,c)=>a+c.charCodeAt(0),0);
      const r=((h*16807)%2147483647)/2147483647;
      const prob=Math.round((0.15+r*0.7)*100)/100;
      const label=prob>=0.5?1:0;
      setResult({label,prob,
        features:{
          "h12_freq_late_mean":label?"+3.8":"-2.1",
          "hangul_ratio":wa.hangulRatio>80?"+0.3":"-0.1",
          "syllable_count":wa.syllables<=4?"+0.2":"-0.3",
          "is_word_like":wa.isWord?"+0.15":"-0.1",
          "rhythm_score":"+0.08"
        }
      });
      setLoading(false);
    },800);
  };

  return<div style={{padding:"32px 24px 80px",maxWidth:900,margin:"0 auto"}}>
    <STitle sub="유행어를 입력하면 AI 모델이 장기 생존 여부를 예측합니다 (0: 단기유행/미유행, 1: 장기생존)">유행어 생존 예측</STitle>

    <Card style={{marginBottom:20}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>예측할 유행어를 입력하세요</div>
      <div style={{display:"flex",gap:12}}>
        <input value={word} onChange={e=>{setWord(e.target.value);setResult(null);}} placeholder="예: 럭키비키, 갓생, 트랄랄레로..."
          onKeyDown={e=>e.key==="Enter"&&predict()}
          style={{flex:1,padding:"14px 18px",borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:16,fontFamily:font,outline:"none"}}
          onFocus={e=>e.target.style.borderColor=C.amber} onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={predict} disabled={!word.trim()||loading} style={{padding:"14px 28px",borderRadius:10,border:"none",background:!word.trim()?C.surfaceLight:`linear-gradient(135deg,${C.amber},${C.coral})`,color:!word.trim()?C.textMuted:"#fff",fontSize:14,fontWeight:700,cursor:word.trim()?"pointer":"not-allowed",fontFamily:font,whiteSpace:"nowrap"}}>
          {loading?"분석 중...":"예측하기"}
        </button>
      </div>

      {/* Auto linguistic analysis */}
      {wa&&word.trim()&&<div style={{marginTop:14,padding:14,borderRadius:10,background:C.bg,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,color:C.textMuted,marginBottom:8}}>자동 추출 언어학적 피처 (L그룹 65개 중 일부)</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[
            ["글자 수",wa.len],["한글 비율",wa.hangulRatio+"%"],["영어 비율",wa.engRatio+"%"],
            ["공백 단어 수",wa.tokens],["음절 수",wa.syllables],
            wa.isWord&&["단어형","✓"],wa.isSent&&["문장형","✓"],
            wa.hasCho&&["초성 포함","✓"],wa.hasRepeat&&["반복문자","✓"],
          ].filter(Boolean).map(([k,v])=>(
            <span key={k} style={{padding:"4px 10px",borderRadius:6,background:C.card,border:`1px solid ${C.border}`,fontSize:11,color:C.textDim}}>
              <b style={{color:C.amber}}>{v}</b> {k}
            </span>
          ))}
        </div>
        <div style={{fontSize:10,color:C.textMuted,marginTop:6}}>* 실제 서비스에서는 paraphrase-multilingual-MiniLM-L12-v2 임베딩(384d) + kiwipiepy 형태소 분석이 자동으로 수행됩니다</div>
      </div>}
    </Card>

    {/* Result */}
    {result&&<Card style={{border:`1px solid ${result.label===1?C.green:C.red}30`}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <div style={{width:64,height:64,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,fontFamily:mono,
          background:result.label===1?C.greenBg:C.redBg,color:result.label===1?C.green:C.red,border:`2px solid ${result.label===1?C.green:C.red}33`}}>
          {result.label}
        </div>
        <div>
          <div style={{fontSize:24,fontWeight:800,color:C.text}}>"{word}"</div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Badge color={result.label===1?C.green:C.red}>{result.label===1?"장기 생존 예상":"단기유행 / 미유행 예상"}</Badge>
            <span style={{fontSize:12,color:C.textDim,alignSelf:"center"}}>확률: {(result.prob*100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{background:C.bg,borderRadius:10,padding:18,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
          <span style={{color:C.red,fontWeight:600}}>단기유행 (0)</span>
          <span style={{color:C.textMuted}}>예측 확률</span>
          <span style={{color:C.green,fontWeight:600}}>장기생존 (1)</span>
        </div>
        <div style={{height:12,background:`linear-gradient(90deg, ${C.red}33, ${C.surfaceLight} 45%, ${C.surfaceLight} 55%, ${C.green}33)`,borderRadius:6,position:"relative"}}>
          <div style={{position:"absolute",left:`${result.prob*100}%`,top:-4,width:20,height:20,borderRadius:"50%",background:result.label===1?C.green:C.red,border:"3px solid #fff",boxShadow:shadow,transform:"translateX(-50%)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.textMuted,marginTop:4}}><span>0%</span><span>50% (threshold)</span><span>100%</span></div>
      </div>

      {/* SHAP-like explanation */}
      <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:10}}>예측 근거 (SHAP 기반)</div>
      <div style={{background:C.bg,borderRadius:10,padding:16}}>
        {Object.entries(result.features).map(([name,val],i)=>{
          const isPos=val.startsWith("+");
          return<div key={name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<4?10:0}}>
            <span style={{color:C.textDim,fontSize:11,width:140,textAlign:"right",flexShrink:0}}>{name}</span>
            <div style={{flex:1,height:16,position:"relative"}}>
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:C.border}}/>
              {isPos?<div style={{position:"absolute",left:"50%",width:`${parseFloat(val)*25}%`,height:12,top:2,borderRadius:"0 3px 3px 0",background:`${C.green}88`,marginLeft:2}}/>
              :<div style={{position:"absolute",right:"50%",width:`${Math.abs(parseFloat(val))*25}%`,height:12,top:2,borderRadius:"3px 0 0 3px",background:`${C.red}88`,marginRight:2}}/>}
            </div>
            <span style={{color:isPos?C.green:C.red,fontSize:12,fontFamily:mono,fontWeight:600,width:40}}>{val}</span>
          </div>;
        })}
        <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:8,fontSize:10,color:C.textMuted}}><span>← 생존 확률 ↓</span><span>생존 확률 ↑ →</span></div>
      </div>

      <Insight color={result.label===1?C.green:C.red}>
        <b style={{color:result.label===1?C.green:C.red}}>참고:</b> 현재는 데모 모드입니다. 실제 서비스에서는 학습된 모델 가중치(pt/pkl)가 로드되어 E(임베딩)+L(언어학적 피처)를 기반으로 예측합니다. 빈도 데이터(F)가 추가되면 예측 정확도가 크게 향상됩니다.
      </Insight>
    </Card>}
  </div>;
}

/* ═══ ANALYSIS (5 experiments) ═══ */
function Analysis(){
  const [exp,setExp]=useState("horizon");
  const [shapWord,setShapWord]=useState("럭키비키");
  const SHAP_WORDS={
    "럭키비키":[{f:"h12_freq_late_mean",v:-3.2},{f:"h12_freq_min",v:-2.1},{f:"hangul_ratio",v:0.3},{f:"syllable_count",v:0.2},{f:"h12_freq_last",v:-1.0},{f:"rhythm_score",v:0.15}],
    "먹방":[{f:"h12_freq_late_mean",v:4.5},{f:"h12_freq_min",v:2.8},{f:"h12_freq_last",v:2.0},{f:"hangul_ratio",v:0.3},{f:"is_word_like",v:0.4},{f:"syllable_count",v:0.2}],
    "갓생":[{f:"h12_freq_late_mean",v:3.2},{f:"h12_freq_min",v:1.5},{f:"hangul_ratio",v:0.3},{f:"h12_freq_last",v:1.0},{f:"morph_count",v:-0.1},{f:"rhythm_score",v:0.2}],
    "어쩔티비":[{f:"h12_freq_late_mean",v:-4.5},{f:"h12_freq_min",v:-3.0},{f:"h12_freq_last",v:-2.5},{f:"is_sentence_like",v:-0.3},{f:"hangul_ratio",v:0.2},{f:"char_len",v:-0.2}],
    "TMI":[{f:"h12_freq_late_mean",v:3.8},{f:"h12_freq_min",v:2.2},{f:"h12_freq_last",v:1.8},{f:"english_ratio",v:-0.2},{f:"char_len",v:0.3},{f:"hangul_ratio",v:-0.5}],
  };
  const shapD=SHAP_WORDS[shapWord]||[];
  const maxS=Math.max(...shapD.map(d=>Math.abs(d.v)),1);

  const TABS=[{id:"horizon",l:"🕐 Horizon 실험"},{id:"model",l:"🏆 모델 비교"},{id:"ablation",l:"🧪 Ablation"},{id:"importance",l:"📊 Feature 중요도"},{id:"kd",l:"🎓 지식 증류"}];

  return<div style={{padding:"32px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
    <STitle sub="LightGBM 기반 5가지 실험 결과">실험 결과</STitle>

    {/* Experiment Tabs */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:24}}>
      {TABS.map(t=><Pill key={t.id} active={exp===t.id} color={C.purple} onClick={()=>setExp(t.id)}>{t.l}</Pill>)}
    </div>

    {/* ── Horizon ── */}
    {exp==="horizon"&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:20}}>
        {horizonData.map(h=>{const c=h.auroc>=0.99?C.green:h.auroc>=0.9?C.amber:h.auroc>=0.8?C.orange:C.coral;return<Card key={h.name}><div style={{fontSize:11,color:C.textMuted}}>{h.name}</div><div style={{fontSize:24,fontWeight:800,color:c,fontFamily:mono}}>{h.auroc.toFixed(3)}</div><div style={{fontSize:10,color:C.textDim}}>{h.desc}</div></Card>;})}
      </div>
      <ChartCard title="데이터 축적에 따른 AUROC · F1 · Balanced Accuracy 변화" sub="텍스트만 → 1개월 → 3개월 → 6개월 → 12개월">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={horizonData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="name" tick={{fill:C.textDim,fontSize:10}} axisLine={{stroke:C.border}} tickLine={false}/>
            <YAxis domain={[0.4,1.05]} tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Line type="monotone" dataKey="auroc" stroke={C.amber} strokeWidth={3} dot={{fill:C.amber,r:6,strokeWidth:2,stroke:"#fff"}} name="AUROC"/>
            <Line type="monotone" dataKey="f1" stroke={C.coral} strokeWidth={2} dot={{fill:C.coral,r:4}} name="F1"/>
            <Line type="monotone" dataKey="bal" stroke={C.purple} strokeWidth={2} dot={{fill:C.purple,r:4}} name="Bal. Acc"/>
            <Legend wrapperStyle={{fontSize:11}}/>
          </LineChart>
        </ResponsiveContainer>
        <Insight color={C.amber}><b style={{color:C.amber}}>핵심 발견:</b> 텍스트만(E+L)으로도 AUROC 0.725 — 유행어 텍스트에 생존 신호가 내재. <b style={{color:C.amber}}>1개월 빈도 추가 시 +0.146</b>으로 가장 큰 단일 점프. 3개월이면 실용적 조기 예측(0.953), 6개월이면 사실상 완벽(0.998).</Insight>
      </ChartCard>
    </>}

    {/* ── Model Comparison ── */}
    {exp==="model"&&<>
      <ChartCard title="실험 1: 모델 성능 비교" sub="feature_set = E+L+F (h12) 조건, 6개 모델">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={modelComp} layout="vertical" margin={{left:100}}>
            <XAxis type="number" domain={[0.85,1.01]} tick={{fill:C.textMuted,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/>
            <YAxis type="category" dataKey="name" tick={{fill:C.textDim,fontSize:12}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Bar dataKey="auroc" name="AUROC" barSize={14} radius={[0,6,6,0]}>
              {modelComp.map((_,i)=><Cell key={i} fill={i<4?C.green:i===4?C.amber:C.coral}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{marginTop:14}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr>{["모델","AUROC","Balanced Acc"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",color:C.textDim,fontWeight:600,borderBottom:`2px solid ${C.border}`,fontSize:12}}>{h}</th>)}</tr></thead>
            <tbody>{modelComp.map((m,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"8px 12px",fontWeight:600,color:C.text}}>{m.name}</td>
              <td style={{padding:"8px 12px",fontFamily:mono,color:m.auroc>=1?C.green:C.amber,fontWeight:700}}>{m.auroc.toFixed(3)}</td>
              <td style={{padding:"8px 12px",fontFamily:mono,color:C.textMid}}>{m.bal.toFixed(3)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <Insight color={C.green}>트리 계열 4종 모두 AUROC=1.0 달성. 12개월 빈도 데이터가 생존 여부를 거의 완벽히 설명하기 때문. Logistic Regression(0.943)과 MLP(0.914)가 오히려 현실적인 성능 기준점.</Insight>
      </ChartCard>
    </>}

    {/* ── Ablation ── */}
    {exp==="ablation"&&<>
      <ChartCard title="실험 2: Feature 조합별 Ablation Study" sub="LightGBM, horizon=12">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ablationData} layout="vertical" margin={{left:100}}>
            <XAxis type="number" domain={[0.6,1.05]} tick={{fill:C.textMuted,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/>
            <YAxis type="category" dataKey="name" tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt} formatter={v=>[v.toFixed(3),"AUROC"]}/>
            <Bar dataKey="auroc" barSize={16} radius={[0,6,6,0]}>
              {ablationData.map((d,i)=><Cell key={i} fill={d.auroc>=1?C.green:d.auroc>=0.72?C.amber:C.coral}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginTop:14}}>
          {[{l:"F 포함 시",v:"1.000",s:"조합 무관하게 만점",c:C.green},{l:"E+L (텍스트)",v:"0.725",s:"현실적 기준점",c:C.amber},{l:"E 단독",v:"0.711",s:"임베딩만",c:C.purple},{l:"L 단독",v:"0.706",s:"언어학만",c:C.coral}].map(i=>
            <Card key={i.l}><div style={{fontSize:11,color:C.textMuted}}>{i.l}</div><div style={{fontSize:22,fontWeight:800,color:i.c,fontFamily:mono}}>{i.v}</div><div style={{fontSize:10,color:C.textDim}}>{i.s}</div></Card>
          )}
        </div>
        <Insight color={C.amber}>F(빈도)가 포함되면 조합 무관 AUROC=1.0. 텍스트 전용(E+L) 0.725가 현실적 기준. 임베딩(E, 0.711)과 언어학(L, 0.706)의 독립 기여가 유사하며, 결합 시 소폭 개선.</Insight>
      </ChartCard>
    </>}

    {/* ── Feature Importance ── */}
    {exp==="importance"&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14,marginBottom:16}}>
        <ChartCard title="Group Permutation Importance" sub="E+L+F (h12) 조건">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={groupImp}>
              <XAxis dataKey="name" tick={{fill:C.textDim,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/>
              <YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tt}/>
              <Bar dataKey="val" name="Importance" barSize={48} radius={[6,6,0,0]}>
                {groupImp.map((g,i)=><Cell key={i} fill={g.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <Insight>Frequency 그룹이 0.53으로 Embedding(0.01), Linguistic(0.02)을 압도. 12개월 빈도 데이터가 모든 정보를 지배.</Insight>
        </ChartCard>

        <ChartCard title="SHAP Top 10 Features" sub="mean(|SHAP value|)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={shapData} layout="vertical" margin={{left:120}}>
              <XAxis type="number" tick={{fill:C.textMuted,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fill:C.textDim,fontSize:10}} axisLine={false} tickLine={false} width={120}/>
              <Tooltip contentStyle={tt}/>
              <Bar dataKey="val" barSize={14} radius={[0,5,5,0]}>
                {shapData.map((d,i)=><Cell key={i} fill={d.group==="F"?C.coral:d.group==="E"?C.purple:C.amber}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:12,marginTop:8}}>{[["F (빈도)",C.coral],["E (임베딩)",C.purple],["L (언어학)",C.amber]].map(([l,c])=><span key={l} style={{fontSize:10,color:c,display:"flex",alignItems:"center",gap:3}}><span style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</span>)}</div>
          <Insight>h12_freq_late_mean(8.20)이 2위(1.62)를 5배 이상 압도. 비-빈도 피처 중 hangul_ratio가 유일하게 SHAP 상위에 등장.</Insight>
        </ChartCard>
      </div>

      {/* Interactive SHAP per word */}
      <ChartCard title="개별 유행어 SHAP 분석" sub="유행어를 선택하면 해당 예측의 피처별 기여도를 보여줍니다">
        <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
          {Object.keys(SHAP_WORDS).map(w=><Pill key={w} active={shapWord===w} color={C.purple} onClick={()=>setShapWord(w)}>{w}</Pill>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
          <div style={{background:C.bg,borderRadius:10,padding:16}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>"{shapWord}" 피처별 SHAP</div>
            {shapD.map((f,i)=>{const pct=Math.abs(f.v)/maxS*100;const isPos=f.v>0;return<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
              <span style={{color:C.textDim,fontSize:11,width:130,textAlign:"right",flexShrink:0}}>{f.f}</span>
              <div style={{flex:1,height:18,position:"relative"}}><div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:C.border}}/>
                {isPos?<div style={{position:"absolute",left:"50%",width:`${pct/2.2}%`,height:14,top:2,borderRadius:"0 4px 4px 0",background:`${C.green}aa`,marginLeft:2}}/>
                :<div style={{position:"absolute",right:"50%",width:`${pct/2.2}%`,height:14,top:2,borderRadius:"4px 0 0 4px",background:`${C.red}aa`,marginRight:2}}/>}
              </div>
              <span style={{color:isPos?C.green:C.red,fontSize:12,fontFamily:mono,fontWeight:600,width:36,textAlign:"right"}}>{f.v>0?"+":""}{f.v}</span>
            </div>;})}
            <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:6,fontSize:10,color:C.textMuted}}><span>← label=0 방향</span><span>label=1 방향 →</span></div>
          </div>
          <div style={{fontSize:12,color:C.textDim,lineHeight:1.8}}>
            {shapWord==="럭키비키"&&<>후반부 평균 빈도(h12_freq_late_mean)가 -3.2로 강하게 label=0 방향. 초기에 폭발적이었으나 후반 급감하여 단기유행 패턴. 한글 비율(+0.3)은 소폭 긍정적이나 빈도 감소를 극복하지 못함.</>}
            {shapWord==="먹방"&&<>후반부 평균 빈도(+4.5), 최소 빈도(+2.8), 마지막 달 빈도(+2.0) 모두 강하게 label=1 방향. 12개월 내내 높은 빈도를 유지하는 전형적 정착 단어 패턴.</>}
            {shapWord==="갓생"&&<>후반부 빈도(+3.2)가 장기생존을 지지. 먹방보다는 약하지만 여전히 안정적 사용 패턴을 보임.</>}
            {shapWord==="어쩔티비"&&<>모든 빈도 피처가 강하게 음수. 후반부 거의 사라진 전형적 단기유행. 문장형 표현(-0.3)도 부정적 요인.</>}
            {shapWord==="TMI"&&<>빈도 피처 모두 강하게 양수. 영어 단어임에도 한국어 환경에서 장기 정착. 다만 hangul_ratio(-0.5)가 유일한 부정 요인.</>}
          </div>
        </div>
      </ChartCard>
    </>}

    {/* ── Knowledge Distillation ── */}
    {exp==="kd"&&<>
      <ChartCard title="실험 5: Teacher-Student Knowledge Distillation" sub="Teacher(LightGBM, E+L+F) → Student(MLP, E+L only)">
        <div style={{padding:14,borderRadius:10,background:C.bg,marginBottom:16,fontSize:13,color:C.textDim,lineHeight:1.7}}>
          <b style={{color:C.text}}>목적:</b> 빈도 데이터(F)를 사용하는 Teacher의 지식을, 텍스트(E+L)만 사용하는 Student에게 전달하여 텍스트 기반 예측 성능을 향상시키는 것.
          <br/><b style={{color:C.text}}>손실 함수:</b> <code style={{background:C.card,padding:"2px 6px",borderRadius:4,fontFamily:mono,fontSize:12}}>Loss = BCE(y, p_student) + α × MSE(p_teacher, p_student)</code>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={kdData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="name" tick={{fill:C.textDim,fontSize:10}} axisLine={{stroke:C.border}} tickLine={false}/>
            <YAxis domain={[0.5,1.05]} tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Bar dataKey="auroc" name="AUROC" barSize={28} radius={[4,4,0,0]}>
              {kdData.map((d,i)=><Cell key={i} fill={i===0?C.green:i===1?C.amber:C.purple}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{marginTop:14}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr>{["모델","Feature","AUROC","Bal. Acc"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",color:C.textDim,fontWeight:600,borderBottom:`2px solid ${C.border}`,fontSize:12}}>{h}</th>)}</tr></thead>
            <tbody>{kdData.map((d,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i===0?C.greenBg:undefined}}>
              <td style={{padding:"8px 10px",fontWeight:600,color:C.text}}>{d.name}</td>
              <td style={{padding:"8px 10px",color:C.textDim,fontSize:12}}>{d.desc}</td>
              <td style={{padding:"8px 10px",fontFamily:mono,color:d.auroc>=1?C.green:C.textMid,fontWeight:700}}>{d.auroc.toFixed(3)}</td>
              <td style={{padding:"8px 10px",fontFamily:mono,color:C.textMid}}>{d.bal.toFixed(3)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <Insight color={C.coral}>
          <b style={{color:C.coral}}>결론:</b> Distillation 효과가 미미합니다 (baseline 0.684 대비 최대 +0.007). Teacher 지식의 대부분이 F(빈도) 피처에 집중되어 있어, E+L만 사용하는 Student에게 의미 있는 전달이 어렵습니다. → Teacher 모델 개선(빈도 의존도 감소) 또는 증류 방법 변경이 필요.
        </Insight>
      </ChartCard>
    </>}
  </div>;
}

/* ═══ DATA & FEATURES ═══ */
function Data(){
  const yearData=Object.entries(YC).map(([y,c])=>({year:y,count:c}));
  const labelDist=[{name:"단기유행/미유행 (0)",val:573,color:C.coral},{name:"장기생존 (1)",val:246,color:C.green}];
  const featGroups=[
    {name:"E — 임베딩",count:384,desc:"paraphrase-multilingual-MiniLM-L12-v2로 유행어 텍스트를 384차원 벡터로 변환",color:C.purple,
      details:["다국어 사전학습 언어모델","의미적 유사도 반영","자동 추출 (입력: 텍스트)"]},
    {name:"L — 언어학적",count:65,desc:"한국어 텍스트의 표층, 음운, 형태소 특성을 규칙 기반으로 추출 (kiwipiepy 사용)",color:C.amber,
      details:["문자/표기: 28개 (글자수, 한글비율, 초성 등)","형태소: 17개 (명사·동사·형용사 비율 등)","표현유형: 10개 (단어형, 밈패턴 등)","음운/운율: 10개 (음절수, 반복점수 등)"]},
    {name:"F — 빈도",count:"38/horizon",desc:"트위터 월별 등장 빈도로부터 통계적 지표 추출. h1/h3/h6/h12 기준별로 생성",color:C.coral,
      details:["기본통계: 11개 (합계, 평균, 최대, 활성월수 등)","추세: 8개 (기울기, 전후반 비율 등)","피크: 8개 (피크값, 감소율 등)","생존성: 6개 (잔류율, 재활성화 등)","분포: 5개 (지니, 엔트로피 등)"]},
  ];

  return<div style={{padding:"32px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
    <STitle sub="819개 유행어 데이터셋과 3가지 피처 그룹">데이터 & 피처 설계</STitle>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:20}}>
      <StatBox label="원본 샘플" value="965" unit="개" sub="month=0 제외 전"/>
      <StatBox label="유효 샘플" value="819" unit="개" color={C.amber}/>
      <StatBox label="장기생존 (1)" value="246" unit="개" color={C.green} sub="30%"/>
      <StatBox label="단기유행 (0)" value="573" unit="개" color={C.coral} sub="70%"/>
      <StatBox label="불균형 비율" value="1:3" color={C.red} sub="양성:음성"/>
      <StatBox label="수집 기간" value="2018–26" color={C.purple}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14,marginBottom:20}}>
      <ChartCard title="레이블 분포">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={labelDist} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="val" nameKey="name" stroke="#fff" strokeWidth={2}>
            {labelDist.map((d,i)=><Cell key={i} fill={d.color}/>)}
          </Pie><Tooltip contentStyle={tt}/><Legend wrapperStyle={{fontSize:11}}/></PieChart>
        </ResponsiveContainer>
        <Insight>레이블 불균형(1:3) → 트리 모델에 scale_pos_weight 적용, AUROC를 주요 지표로 사용, Validation set에서 최적 threshold 탐색.</Insight>
      </ChartCard>

      <ChartCard title="연도별 유행어 분포">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={yearData}>
            <XAxis dataKey="year" tick={{fill:C.textDim,fontSize:11}} axisLine={{stroke:C.border}} tickLine={false}/>
            <YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Bar dataKey="count" radius={[4,4,0,0]} barSize={24}>
              {yearData.map((_,i)=><Cell key={i} fill={i>=7?C.green:C.amber}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{fontSize:11,color:C.textMuted,marginTop:6}}>수집 기준일: 2026년 5월 · 2025~2026 데이터는 일부 월에 결측 존재</div>
      </ChartCard>
    </div>

    {/* Feature Groups */}
    <STitle sub="임베딩(E) + 언어학(L) + 빈도(F) 3개 그룹">피처 설계</STitle>
    <div style={{display:"grid",gap:14}}>
      {featGroups.map(g=><Card key={g.name} style={{borderLeft:`4px solid ${g.color}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{color:g.color,fontSize:16,fontWeight:700}}>{g.name} <span style={{fontFamily:mono,fontSize:13}}>({g.count}개)</span></div>
            <div style={{color:C.textDim,fontSize:13,marginTop:4,maxWidth:600}}>{g.desc}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12}}>
          {g.details.map(d=><span key={d} style={{padding:"5px 10px",borderRadius:6,background:C.bg,border:`1px solid ${C.border}`,fontSize:11,color:C.textDim}}>{d}</span>)}
        </div>
      </Card>)}
    </div>

    <Card style={{marginTop:20}}>
      <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:10}}>레이블 기준</div>
      <div style={{fontSize:13,color:C.textDim,lineHeight:1.8}}>
        label=1 (장기 생존)의 기준: 최초 등장으로부터 <b style={{color:C.text}}>7~12개월 중</b> 등장 빈도수가 <b style={{color:C.text}}>300 이상</b>인 월이 <b style={{color:C.text}}>최소 3개 이상</b>일 경우.
        즉, 유행어가 등장 후 반년 이상 지나서도 여전히 활발하게 사용되고 있으면 "장기 생존"으로 판단합니다.
        빈도수는 트위터에서 동일 조건으로 크롤링한 상대적 수치이며, 절대적 등장 횟수와는 다릅니다.
      </div>
    </Card>
  </div>;
}

/* ═══ APP ═══ */
export default function App(){
  const [page,setPage]=useState("home");
  useEffect(()=>{const l=document.createElement("link");l.href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable.min.css";l.rel="stylesheet";document.head.appendChild(l);},[]);
  const go=p=>{setPage(p);window.scrollTo({top:0,behavior:"smooth"});};
  const NAV=[{id:"home",l:"홈",i:"🏠"},{id:"predict",l:"생존 예측",i:"🔮"},{id:"analysis",l:"실험 결과",i:"📊"},{id:"data",l:"데이터",i:"📈"}];
  return<div style={{fontFamily:font,background:C.bg,color:C.text,minHeight:"100vh"}}>
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 20px",height:50,background:`${C.bg}ee`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>go("home")}>
        <span style={{fontSize:17,fontWeight:800,background:`linear-gradient(135deg,${C.amber},${C.coral})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FL</span>
        <span style={{color:C.textDim,fontSize:12}}>유행어 생존 예측</span>
      </div>
      <div style={{display:"flex",gap:2}}>{NAV.map(n=><button key={n.id} onClick={()=>go(n.id)} style={{padding:"5px 10px",borderRadius:7,cursor:"pointer",border:"none",fontFamily:font,fontSize:12,fontWeight:page===n.id?700:500,background:page===n.id?C.amberBg:"transparent",color:page===n.id?C.amber:C.textDim,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12}}>{n.i}</span><span className="nl">{n.l}</span></button>)}</div>
    </nav>
    <div style={{paddingTop:50}}>
      {page==="home"&&<Home go={go}/>}
      {page==="predict"&&<Predict/>}
      {page==="analysis"&&<Analysis/>}
      {page==="data"&&<Data/>}
    </div>
    <footer style={{textAlign:"center",padding:"24px 20px",borderTop:`1px solid ${C.border}`,color:C.textMuted,fontSize:11}}>© 2025 FL Team — 유행어 생존 예측 프로젝트 · 손정훈 · 이상아 · 이재준</footer>
    <style>{`@media(max-width:600px){.nl{display:none;}}`}</style>
  </div>;
}
