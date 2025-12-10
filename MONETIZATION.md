# 💰 How to Earn Money with Cosmic Timer

Since users will keep this tab open for long periods (focus sessions), it is an excellent candidate for **passive monetization** via display ads.

Here is the step-by-step process to start earning.

## Option 1: Google AdSense (Easiest & Most Popular)

Google AdSense is the standard for web monetization. It automatically shows ads relevant to your user.

### 1. Sign Up

Go to [Google AdSense](https://adsense.google.com/) and sign up with your Google account.

### 2. Add Your Site

- Click **Sites** > **New Site**.
- Enter your deployed URL (e.g., `https://cosmic-timer.vercel.app`).
- You will get a verification snippet. You generally put this in your `src/app/layout.tsx` `<head>` (or use `next/script`).

> [!IMPORTANT] > **Domain Issue?**
> If you are trying to add a subdomain like `timer.shivamingale.com`, Google AdSense usually requires you to add the **root domain** (`shivamingale.com`) first.
>
> 1. Add `shivamingale.com` to "Sites".
> 2. Once verified, subdomains are often automatically handled or can be added as "Custom channels" or sites depending on your account.
> 3. If you don't own the root domain, you might need to use a platform that allows subdomains (like some hosting provider integrations), but generally, owning the root is required.

### 3. Create an Ad Unit

- Go to **Ads** > **By ad unit**.
- Choose **Display ads**.
- Name it "Timer Sidebar".
- Select **Fixed** size (e.g., 300x250) or **Responsive**.
- Click **Create** and copy the code.

### 4. Integrate into Code

Open `src/components/AdSpace.tsx` and replace the placeholder text with your ad code.

**Important**: In React/Next.js, standard `<script>` tags inside components sometimes behave oddly. The best way for AdSense is:

```tsx
// src/components/AdSpace.tsx
import Script from "next/script";

export default function AdSpace() {
  return (
    <div className="...">
      {/* 1. Load the AdSense Script globally (or once here) */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossOrigin="anonymous"
      />

      {/* 2. The Ad Element */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {/* 3. Trigger the push */}
      <Script id="trigger-ads">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
```

## Option 2: Carbon Ads (Best for Tech/Dev Tools)

If your audience is mostly developers or designers (which "Awwwards" style apps attract), **Carbon Ads** is much better.

- It shows **one high-quality ad**.
- It looks beautiful and professional.
- **Requirement**: You usually need significant traffic (>1k views/month) to get accepted.

## 📈 Tips for Maximizing Revenue

1.  **Placement Matters**: We placed `AdSpace` in the bottom-right. This is good because it's visible but doesn't block the timer.
2.  **Traffic is Key**: Ads pay per view (CPM) or click (CPC). Share your app on Twitter, Reddit (r/webdev, r/productivity), and Product Hunt to get initial users.
3.  **Don't be Annoying**: Users are here to focus. **Do not** add pop-ups or video ads with sound. The current subtle banner approach is best for retention.
