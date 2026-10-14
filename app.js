/* ==========================================================================
   AURA CORE CONTROLLER - MODULE MANAGER (ระบบควบคุมโมดูลหลัก)
   ========================================================================== */

// 1. คลังข้อมูลสถานีตรวจวัดสภาพอากาศและพื้นที่เฝ้าระวังอุทกภัยระดับประเทศ
const auraStationDatabase = {
    bangkok: { name: "สถานีกรุงเทพฯ (เซ็นทรัล)", sub: "ASIA / BANGKOK", lat: 13.7563, lng: 100.5018, temp: "31°", sky: "สภาพอากาศ: มีเมฆบางส่วน", icon: "🌤️", wind: "12 km/h", humid: "68%", rain: "10%", alert: "ปกติ", level: "safe" },
    chiangmai: { name: "สถานีเชียงใหม่ (ลุ่มน้ำปิง)", sub: "ASIA / CHIANG_MAI", lat: 18.7883, lng: 98.9853, temp: "24°", sky: "สภาพอากาศ: ฝนตกสะสม", icon: "🌧️", wind: "8 km/h", humid: "95%", rain: "85%", alert: "เฝ้าระวังน้ำหลาก", level: "warning" },
    phuket: { name: "สถานีภูเก็ต (ชายฝั่งอันดามัน)", sub: "ASIA / PHUKET", lat: 7.8804, lng: 98.3923, temp: "29°", sky: "สภาพอากาศ: พายุฝนฟ้าคะนอง", icon: "⛈️", wind: "30 km/h", humid: "98%", rain: "95%", alert: "วิกฤต! น้ำท่วมขังฉับพลัน", level: "danger" }
};

let currentSelectedStation = "bangkok";
let auraGlobe;

// 2. ปลุกพลังระบบลูกโลก 3 มิติในธีมสีเข้ม Sci-Fi สอดรับกับ CSS ของ AURA
function bootstrapAuraGlobe() {
    const stage = document.getElementById('globe');
    if (!stage) return;

    // สร้างลูกโลก 3 มิติด้วยชุดสีกรมท่า-น้ำเงินเข้มขรึม
    auraGlobe = Globe()
        (stage)
        .globeImageUrl('https://unpkg.com') // ใช้แผนที่ธีมมืดล้ำยุค
        .backgroundColor('rgba(0,0,0,0)') // ปล่อยพื้นหลังโปร่งแสงเพื่อให้เห็น gradient ของบอดี้หลัก
        .showAtmosphere(true)
        .atmosphereColor('#5ab0ff') // ออร่าชั้นบรรยากาศเรืองแสงสีฟ้านีออน
        .atmosphereDaylightAlpha(0.15);

    // ปรับสัดส่วนรองรับขนาดจอคอมพิวเตอร์และโทรศัพท์อัตโนมัติ
    function fitGlobeToScreen() {
        auraGlobe.width(stage.offsetWidth);
        auraGlobe.height(stage.offsetHeight);
    }
    window.addEventListener('resize', fitGlobeToScreen);
    fitGlobeToScreen();

    // เริ่มปักหมุดสถานีตรวจวัดลงบนผิวโลก
    renderStationMarkers();
    
    // ตั้งค่ากล้องเริ่มต้นให้แพลนมาจับที่ตำแหน่งประเทศไทย
    auraGlobe.pointOfView({ lat: 13.0, lng: 100.5, alt: 1.4 }, 500);
}

// 3. ฟังก์ชันคำนวณและวาดหมุดจุดตรวจวัดพยากรณ์อากาศ 3 มิติ
function renderStationMarkers() {
    const markerArray = Object.keys(auraStationDatabase).map(key => {
        const station = auraStationDatabase[key];
        let colorCode = '#3ddc97'; // safe (สีเขียวดีไซน์กู๊ด)
        if (station.level === 'warning') colorCode = '#ff9f43'; // warning (สีส้ม)
        if (station.level === 'danger') colorCode = '#ff5d6c';  // danger (สีแดงวิกฤต)

        return {
            id: key,
            lat: station.lat,
            lng: station.lng,
            color: colorCode,
            name: station.name
        };
    });

    // วาดระบบหมุดและป้ายนีออนลอยตัวเหนือผิวโลก
    auraGlobe.pointsData(markerArray)
             .pointAltitude(0.04)
             .pointColor('color')
             .pointRadius(0.25)
             .labelsData(markerArray)
             .labelLat(d => d.lat)
             .labelLng(d => d.lng)
             .labelText(d => d.name)
             .labelSize(0.6)
             .labelColor(() => '#8fa0c0')
             .labelResolution(2);
}

// 4. ฟังก์ชันอัปเดตและสลับข้อมูลสภาพอากาศเมื่อผู้ใช้เลือกสถานี
function switchStationData(stationKey) {
    currentSelectedStation = stationKey;
    const data = auraStationDatabase[stationKey];
    if (!data) return;

    // อัปเดตกราฟิกแถบรายชื่อขวามือให้แสดงกรอบไฮไลต์สว่างสีฟ้า
    document.querySelectorAll('.wrow').forEach(row => {
        row.classList.remove('sel');
        if(row.getAttribute('data-id') === stationKey) {
            row.classList.add('sel');
        }
    });

    // เปลี่ยนข้อมูลแผงฝั่งซ้ายแบบแอนิเมชันข้อมูลเรียลไทม์
    document.getElementById('current-loc-name').innerText = data.name;
    document.getElementById('current-loc-sub').innerText = data.sub;
    document.getElementById('main-temp').innerText = data.temp;
    document.getElementById('main-icon').innerText = data.icon;
    document.getElementById('main-sky').innerText = data.sky;
    document.getElementById('stat-wind').innerText = data.wind;
    document.getElementById('stat-humid').innerText = data.humid;
    document.getElementById('stat-rain').innerText = data.rain;

    // หมุนลูกโลกสไลด์โฟกัสกล้องไปหาจุดตรวจวัดนั้นๆ ทันทีแบบสมูท
    auraGlobe.pointOfView({ lat: data.lat, lng: data.lng, alt: 1.3 }, 1500);
}

// 5. ระบบโครงสร้างสร้างรายชื่อสถานีฝั่งขวามือแบบ Dynamic
function buildStationsMenuUI() {
    const listContainer = document.getElementById('stations-list');
    if (!listContainer) return;

    listContainer.innerHTML = "";
    Object.keys(auraStationDatabase).forEach(key => {
        const station = auraStationDatabase[key];
        
        let statusChipColor = 'var(--good)';
        if (station.level === 'warning') statusChipColor = 'var(--usg)';
        if (station.level === 'danger') statusChipColor = 'var(--bad)';

        const buttonRow = document.createElement('button');
        buttonRow.className = `wrow ${key === currentSelectedStation ? 'sel' : ''}`;
        buttonRow.setAttribute('data-id', key);
        buttonRow.innerHTML = `
            <span class="n">${station.name}</span>
            <span class="t">${station.temp}</span>
            <span class="chip" style="background:${statusChipColor}; color:#06101f">${station.alert}</span>
        `;

        // ฝังระบบคลิกเพื่อสลับสายตาสถานี
        buttonRow.addEventListener('click', () => switchStationData(key));
        listContainer.appendChild(buttonRow);
    });
}

// 6. ระบบรับสัญญาณสถานการณ์อุทกภัยฉุกเฉินระดับประเทศ (Emergency Alert Broadcast)
function setupEmergencyAlertSystem() {
    const alertBtn = document.getElementById('btn-subscribe-alert');
    const broadcastDisplay = document.getElementById('broadcast-center');
    const liveDot = document.getElementById('live-dot');
    const liveStatusText = document.getElementById('live-status');

    if (!alertBtn) return;

    alertBtn.addEventListener('click', () => {
        alertBtn.innerText = "✅ เชื่อมต่อศูนย์ภัยแล้ว";
        alertBtn.style.background = "#3ddc97";
        alertBtn.style.boxShadow = "0 4px 10px rgba(61,220,151,0.2)";

        // จำลองสถานการณ์ด่วน: ศูนย์ตรวจวัดยิงสัญญาณภัยพิบัติน้ำล้นตลิ่ง/ดินถล่มลงมาในระบบอีก 2 วินาที
        setTimeout(() => {
            // เปลี่ยนจุดกระพริบด้านบนระบบให้เป็นสีแดงเร่งด่วนขั้นวิกฤต
            if (liveDot) liveDot.className = "dot danger-mode";
            if (liveStatusText) liveStatusText.innerText = "🚨 ตรวจพบสัญญาณภัยพิบัติขั้นวิกฤต!";

            // แสดงประกาศด่วนที่สุดลงบนกรอบด้านขวา
            if (broadcastDisplay) {
                broadcastDisplay.innerHTML = `
                    <div style="color: var(--bad); font-weight:700; margin-bottom: 6px;">⚠️ [ประกาศด่วนที่สุดจากศูนย์เครือข่าย AURA]</div>
                    <p style="color: var(--text); line-height: 1.5; margin:0;">
                        เกิดมรสุมตกสะสมวิกฤตในพื้นที่ลุ่มแม่น้ำหลัก ส่งผลให้น้ำป่าไหลหลากหลั่งไหลเข้าท่วมพื้นที่ท้ายเขื่อนและที่ราบต่ำฉับพลัน ขอให้ประชาชนเปิดแอปและเคลื่อนย้ายสิ่งของอพยพทันที!
                    </p>
                `;
                broadcastDisplay.style.borderColor = "var(--bad)";
            }

            // สั่งให้กล้องของลูกโลก 3 มิติ แพลนหมุนความเร็วสูงไปจับที่จุดพื้นที่วิญต (พิกัดสถานีภาคใต้เสี่ยงภัย) ทันที
            switchStationData("phuket");

            // ยิงระบบเสียงหรือป๊อปอัปแจ้งเตือนหลักภัยพิบัติของเครื่องคอม/มือถือ
            alert("🚨 [AURA NATIONAL WARNING]\n\nสัญญาณแจ้งเตือนภัยพิบัติอุทกภัยน้ำท่วมฉับพลันมีผลบังคับใช้ในพิกัดของคุณแล้ว! ระบบระบุตำแหน่งวิกฤตด้วยหมุดเรืองแสงสีแดงบนแผนที่โลก ขอให้อพยพขึ้นที่สูงทันทีเพื่อความปลอดภัยครับ");
        }, 2000);
    });
}

// เริ่มต้นเปิดสวิตช์ฟังก์ชันระบบทั้งหมดเมื่อดาวน์โหลดทรัพยากรหน้าเว็บพร้อม
window.addEventListener('DOMContentLoaded', () => {
    bootstrapAuraGlobe();
    buildStationsMenuUI();
    setupEmergencyAlertSystem();
});
