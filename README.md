# DELitALL Internship Portal

A modern, lightweight internship portal for managing intern attendance and daily progress.
Powered by Next.js 14, Firebase Authentication, and Google Sheets/Drive as a scalable lightweight backend.

## Features
- **Intern Dashboard**: Track internship progress and view profile.
- **Daily Submission**: Simple form to log daily tasks, hours, and learnings.
- **Google Drive Uploads**: Automatic drag-and-drop file upload to structured Google Drive folders.
- **Admin Dashboard**: Monitor all interns, view stats, and access detailed reports.
- **Google Sheets Database**: All submissions and intern profiles are tracked in a single Master Google Sheet.

## 🚀 Setup & Deployment

### 1. Configure APIs (Firebase & Google Cloud)
Please read **[SETUP.md](./SETUP.md)** for detailed, step-by-step instructions on setting up:
1. Firebase Authentication
2. Google Cloud Service Account
3. Google Sheets & Google Drive

### 2. Local Development
Once you have your `.env.local` configured as per `SETUP.md`:
```bash
cd portal
npm install
npm run dev
```
Open `http://localhost:3000`.

### 3. Deploying to Vercel (Production)

Deploying to Vercel takes just a few minutes and gives you a public link (e.g., `delitall-portal.vercel.app`) that any intern can access from any computer.

1. **Push to GitHub**:
   - Initialize a Git repository in this folder and push it to a private GitHub repository.
2. **Import to Vercel**:
   - Go to [Vercel.com](https://vercel.com) and create an account.
   - Click **Add New Project** and connect your GitHub account.
   - Select your new repository.
3. **Configure Environment Variables**:
   - In the Vercel deployment settings, expand the **Environment Variables** section.
   - Copy all the variables from your `.env.local` file and paste them into Vercel.
   - *Important*: When pasting the `GOOGLE_PRIVATE_KEY` into Vercel, make sure the literal `\n` characters are preserved, or wrap the whole key in quotes so it remains a single valid multiline string.
4. **Deploy**:
   - Click **Deploy**. Vercel will build and launch your application automatically.
5. **Share the Link**:
   - Once deployed, Vercel gives you a public domain. Share this link with your interns. They can just click it and log in!

## Admin Usage
- Ensure the admin's email exactly matches `NEXT_PUBLIC_ADMIN_EMAIL` in your `.env.local`.
- Admins must manually register new Interns via the Admin Dashboard, which writes their profile to the "Interns" tab in the Google Sheet.
