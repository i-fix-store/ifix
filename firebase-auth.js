import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBE2-qaGOOlmhn9QA01J5wizJ_CcMMh7qE",
  authDomain: "ifix-store-eecd9.firebaseapp.com",
  projectId: "ifix-store-eecd9",
  storageBucket: "ifix-store-eecd9.firebasestorage.app",
  messagingSenderId: "862863699996",
  appId: "1:862863699996:web:7af653f4de7d0baa0fafd9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginBtn = document.getElementById("loginBtn");
const profileBox = document.getElementById("userProfileBox");
const headerPhoto = document.getElementById("headerUserPhoto");
const headerLetter = document.getElementById("headerUserLetter");

// دالة مشتركة ومحسنة للتحكم في عرض الصورة الشخصية أو الحرف البديل
function handleUserAvatarUI(user) {
    if (!user) return;
    
    const displayName = user.displayName || "مستخدم";

    // دالة داخلية لبناء الحرف البديل بشكل احترافي
    function showHeaderFallback() {
        const firstLetter = displayName.trim().charAt(0).toUpperCase();
        if (headerLetter) {
            headerLetter.innerText = firstLetter;
            
            // توليد لون خلفية عشوائي ثابت يعتمد على الحرف لمنع التكرار العشوائي
            const colors = ['#0070d1', '#1ea362', '#ea4335', '#fbbc05', '#8e44ad', '#2c3e50', '#d35400'];
            const colorIndex = firstLetter.charCodeAt(0) % colors.length;
            headerLetter.style.background = colors[colorIndex];
            headerLetter.style.display = "flex";
        }
        if (headerPhoto) headerPhoto.style.display = "none";
    }

    if (user.photoURL) {
        // 1. تأمين مسار الصورة وتحويلها إلى https
        let cleanUrl = user.photoURL.replace("http://", "https://");
        
        // 2. تعديل الحجم لطلب الحجم الأصلي s0 لتجنب حجب حماية سيرفرات جوجل
        if (cleanUrl.includes("googleusercontent.com")) {
            cleanUrl = cleanUrl.replace(/=s\d+-c/, "=s0");
        }

        if (headerPhoto) {
            headerPhoto.src = cleanUrl;
            headerPhoto.style.display = "block";
            
            // 3. إذا حجب المتصفح الصورة بعد كل هذا، يتم تشغيل الحرف التلقائي فوراً
            headerPhoto.onerror = function() {
                showHeaderFallback();
            };
        }
        if (headerLetter) headerLetter.style.display = "none";
    } else {
        showHeaderFallback();
    }
}

// 1. حدث تسجيل الدخول عبر Google
loginBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // حفظ أو تحديث بيانات المستخدم بداخل Firestore
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName,
        email: user.email,
        createdAt: new Date()
      },
      { merge: true }
    );

    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
        userNameEl.innerHTML = "مرحباً " + user.displayName + " 👋";
    }

    if (loginBtn) loginBtn.style.display = "none";
    if (profileBox) profileBox.style.display = "block";
    
    // تشغيل منطق الصور فور تسجيل الدخول الناجح
    handleUserAvatarUI(user);

  } catch (error) {
      console.error("حدث خطأ أثناء تسجيل الدخول:", error);
  }
});

// 2. مراقبة حالة تسجيل الدخول عند تحميل الصفحة
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User Logged:", user.displayName);

    if (loginBtn) loginBtn.style.display = "none";
    if (profileBox) profileBox.style.display = "block";

    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
        userNameEl.innerHTML = "مرحباً " + user.displayName + " 👋";
    }

    // إدارة الهوية البصرية (صورة أو أول حرف)
    handleUserAvatarUI(user);

  } else {
    if (loginBtn) loginBtn.style.display = "flex";
    if (profileBox) profileBox.style.display = "none";
    
    const userNameEl = document.getElementById("userName");
    if (userNameEl) userNameEl.innerHTML = "";
  }
});

// 3. الانتقال لصفحة الملف الشخصي عند الضغط على الـ Box الخاص بالمستخدم
if (profileBox) {
    profileBox.addEventListener("click", () => {
        window.location.href = "profile.html";
    });
}
