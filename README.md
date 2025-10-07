 # 🔐 Password Vault

A secure, privacy-first password manager built with **Next.js**, **MongoDB**, and **TypeScript**.  
This project lets users **generate**, **encrypt**, **store**, and **manage** passwords safely inside their personal vault.

---

## 🚀 Features

- ✅ **Strong Password Generator** — Create random, secure passwords instantly  
- 🔒 **End-to-End Encryption** — Passwords are encrypted in the browser before saving  
- 💾 **Personal Vault** — Add, view, edit, and delete saved passwords  
- ☁️ **Secure Cloud Storage** — Data stored safely in MongoDB  
- 📤 **Export & Import Vault** — Backup or restore encrypted data easily  
- ⚡ **Fast & Modern UI** — Built with React 19, Next.js 15, and Tailwind CSS 4  

---

## 🧱 Tech Stack

**Frontend:**  
- Next.js 15 (App Router)  
- React 19  
- Tailwind CSS 4  
- React Hot Toast for notifications  
- React Icons  

**Backend / API:**  
- Next.js API Routes  
- MongoDB (via Mongoose)  
- bcryptjs for password hashing  
- jsonwebtoken for authentication  

---


## ⚙️ Installation & Setup

### 1️⃣ Clone the repo

```bash
git clone https://github.com/BheemaReddy07/password-vault.git
cd password-vault

npm install

npm run dev
```

## Environtment Variables

- MONGODB_URI=your_mongodb_connection_string
- JWT_SECRET=your_secret_key


## 💡 Security Notes

- All passwords are AES-encrypted using a generated key in the browser.

- The server never sees raw passwords.

- Uses JWT authentication for secure user sessions.

## 🧑‍💻 Developer

- 👤 Bheema Subramanyeswar Reddy Tatiparthi
- 💻 Full Stack Developer (MERN / Next.js)
- 📧 bheemareddy2910@gmail.com
  
- 🌐 https://bheemareddy-portfolio.vercel.app
