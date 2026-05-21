const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(f,t,d,v=0.1){if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d);}
function playClick(){playTone(600,'triangle',0.05);}
function playCorrect(){playTone(523,'sine',0.15,0.15);setTimeout(()=>playTone(659,'sine',0.15,0.15),100);setTimeout(()=>playTone(784,'sine',0.3,0.15),200);}
function playWrong(){playTone(200,'sawtooth',0.3,0.2);setTimeout(()=>playTone(150,'sawtooth',0.4,0.25),150);}
function playClear(){[523,587,659,698,784,880,987,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'square',0.1),i*100));}

const screens = {
    title: document.getElementById('screen-title'),
    stage1: document.getElementById('screen-stage1'),
    stage2: document.getElementById('screen-stage2'),
    stage3: document.getElementById('screen-stage3'),
    gameover: document.getElementById('screen-gameover'),
    clear: document.getElementById('screen-clear')
};

function hideAllScreens(){ Object.values(screens).forEach(s => s.classList.remove('active')); }

// ========== STAGE 1: 2進小数ビットトグル ==========
const missions1 = [
    { target: 0.75, hint: "1/2 + 1/4 = ？" },
    { target: 0.625, hint: "1/2 + 1/8 = ？" },
    { target: 0.5, hint: "1/2 だけONにしてみよう" },
    { target: 0.875, hint: "1/2 + 1/4 + 1/8 = ？" }
];
let currentMission1;

function startGame(){
    playClick(); hideAllScreens();
    // reset stage 1
    ['b1','b2','b3','b4'].forEach(id => {
        const el = document.getElementById(id);
        el.textContent = '0'; el.classList.remove('on');
    });
    updateBinaryDisplay();
    currentMission1 = missions1[Math.floor(Math.random() * missions1.length)];
    document.getElementById('mission1-target').textContent = `10進数 ${currentMission1.target} を作ってください！`;
    document.getElementById('mission1-hint').textContent = `ヒント: ${currentMission1.hint}`;
    screens.stage1.classList.add('active');
}

function toggleBit(id){
    playClick();
    const el = document.getElementById(id);
    if(el.textContent === '0'){ el.textContent = '1'; el.classList.add('on'); }
    else { el.textContent = '0'; el.classList.remove('on'); }
    updateBinaryDisplay();
}

function updateBinaryDisplay(){
    const bits = ['b1','b2','b3','b4'].map(id => document.getElementById(id).textContent);
    document.getElementById('binary-result').textContent = '0.' + bits.join('');
    const weights = [0.5, 0.25, 0.125, 0.0625];
    let dec = 0;
    bits.forEach((b,i) => { if(b==='1') dec += weights[i]; });
    document.getElementById('decimal-result').textContent = dec;
}

function checkStage1(){
    const bits = ['b1','b2','b3','b4'].map(id => document.getElementById(id).textContent);
    const weights = [0.5, 0.25, 0.125, 0.0625];
    let dec = 0;
    bits.forEach((b,i) => { if(b==='1') dec += weights[i]; });
    if(Math.abs(dec - currentMission1.target) < 0.001){
        playCorrect();
        alert('🎉 お客様「完璧な2進小数だ！」\n\n✅ 2進小数は 1/2, 1/4, 1/8... の位で表現する！');
        hideAllScreens();
        initStage2();
        screens.stage2.classList.add('active');
    } else {
        playWrong();
        alert(`❌ お客様「${currentMission1.target}を注文したのに${dec}が来た！」\n\nヒント: ${currentMission1.hint}`);
    }
}

// ========== STAGE 2: 正規化スライダー ==========
const normProblems = [
    { digits: [1,0,1,1], origPoint: 2, label: "10.11", answer: { point: 1, exp: 1 } },
    { digits: [1,1,0,1], origPoint: 3, label: "110.1", answer: { point: 1, exp: 2 } },
    { digits: [1,0,0,1], origPoint: 0, label: "0.001001", answer: { point: 3, exp: -3 } }
];
let currentNorm;

function initStage2(){
    // 10.11の正規化（小数点を移動）
    currentNorm = normProblems[Math.floor(Math.random() * 2)]; // 最初の2問からランダム
    const d = currentNorm.digits;
    document.getElementById('nd0').textContent = d[0];
    document.getElementById('nd1').textContent = d[1];
    document.getElementById('nd2').textContent = d[2];
    document.getElementById('nd3').textContent = d[3];
    document.getElementById('point-slider').value = currentNorm.origPoint;
    document.getElementById('mission2-target').textContent = 
        `「${currentNorm.label}」を「1.xxxx × 2ⁿ」の形にしよう！小数点をスライドさせてみて！`;
    movePoint();
}

function movePoint(){
    const pos = parseInt(document.getElementById('point-slider').value);
    const d = [
        document.getElementById('nd0').textContent,
        document.getElementById('nd1').textContent,
        document.getElementById('nd2').textContent,
        document.getElementById('nd3').textContent
    ];
    // Build display string with point at position pos
    let intPart = d.slice(0, pos).join('') || '0';
    let fracPart = d.slice(pos).join('') || '0';
    const origPos = currentNorm.origPoint;
    const expVal = origPos - pos;
    document.getElementById('norm-result').textContent = `${intPart}.${fracPart} × 2^${expVal}`;
    document.getElementById('norm-exp').textContent = expVal;
}

function checkStage2(){
    const pos = parseInt(document.getElementById('point-slider').value);
    if(pos === currentNorm.answer.point){
        playCorrect();
        alert('🎉 お客様「美しい正規化だ！」\n\n✅ 正規化 = 先頭を1にして「1.xxx × 2ⁿ」の形にすること！\n先頭の1は必ず1だから省略できる（ケチ表現）！');
        hideAllScreens();
        initStage3();
        screens.stage3.classList.add('active');
    } else {
        playWrong();
        alert('❌ まだ正規化できていません！\n\n先頭の数字が「1」になるように小数点を移動させよう！');
    }
}

// ========== STAGE 3: IEEE 754 組み立て ==========
const ieeeMissions = [
    { target: 5.5, sign: 0, exp: 2, mantissa: [0,1,1,0], desc: "5.5" },
    { target: -3.0, sign: 1, exp: 1, mantissa: [1,0,0,0], desc: "-3.0" },
    { target: 1.5, sign: 0, exp: 0, mantissa: [1,0,0,0], desc: "1.5" }
];
let currentIEEE;

function initStage3(){
    currentIEEE = ieeeMissions[Math.floor(Math.random() * ieeeMissions.length)];
    // reset
    const st = document.getElementById('sign-toggle');
    st.textContent = '0 (正)'; st.classList.remove('negative');
    document.getElementById('exp-slider').value = 0;
    ['m0','m1','m2','m3'].forEach(id => {
        const el = document.getElementById(id);
        el.textContent = '0'; el.classList.remove('on');
    });
    document.getElementById('mission3-target').textContent = 
        `10進数「${currentIEEE.desc}」を組み立ててください！`;
    updateIEEE();
}

function toggleSign(){
    playClick();
    const st = document.getElementById('sign-toggle');
    if(st.classList.contains('negative')){
        st.textContent = '0 (正)'; st.classList.remove('negative');
    } else {
        st.textContent = '1 (負)'; st.classList.add('negative');
    }
    updateIEEE();
}

function toggleMBit(id){
    playClick();
    const el = document.getElementById(id);
    if(el.textContent === '0'){ el.textContent = '1'; el.classList.add('on'); }
    else { el.textContent = '0'; el.classList.remove('on'); }
    updateIEEE();
}

function updateIEEE(){
    const sign = document.getElementById('sign-toggle').classList.contains('negative') ? 1 : 0;
    const expActual = parseInt(document.getElementById('exp-slider').value);
    document.getElementById('exp-actual').textContent = expActual;
    document.getElementById('exp-biased').textContent = expActual + 127;
    
    const mBits = ['m0','m1','m2','m3'].map(id => parseInt(document.getElementById(id).textContent));
    // 1.m0m1m2m3 × 2^exp
    let mantissaVal = 1;
    const mWeights = [0.5, 0.25, 0.125, 0.0625];
    mBits.forEach((b,i) => { if(b) mantissaVal += mWeights[i]; });
    
    let result = mantissaVal * Math.pow(2, expActual);
    if(sign) result = -result;
    
    document.getElementById('ieee-decimal').textContent = result;
}

function checkStage3(){
    const sign = document.getElementById('sign-toggle').classList.contains('negative') ? 1 : 0;
    const expActual = parseInt(document.getElementById('exp-slider').value);
    const mBits = ['m0','m1','m2','m3'].map(id => parseInt(document.getElementById(id).textContent));
    
    const signOK = sign === currentIEEE.sign;
    const expOK = expActual === currentIEEE.exp;
    const mantissaOK = mBits.every((b,i) => b === currentIEEE.mantissa[i]);
    
    if(signOK && expOK && mantissaOK){
        playCorrect();
        setTimeout(() => {
            playClear();
            hideAllScreens();
            screens.clear.classList.add('active');
        }, 500);
    } else {
        playWrong();
        let hints = [];
        if(!signOK) hints.push('符号が違います！正の数? 負の数?');
        if(!expOK) hints.push(`指数が違います！${currentIEEE.desc}を正規化すると2の何乗？`);
        if(!mantissaOK) hints.push('仮数部が違います！ケチ表現で「1.」の後に来るビットは？');
        alert('❌ お客様「これは注文と違う！」\n\n' + hints.join('\n'));
    }
}
