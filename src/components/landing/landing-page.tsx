"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  { number: "01", title: "See the whole picture", text: "Bring income, spending, budgets, and savings into one calm, readable view.", accent: "mint" },
  { number: "02", title: "Make better next moves", text: "Use transparent insights to understand patterns without black-box advice.", accent: "lime" },
  { number: "03", title: "Build habits that hold", text: "Simple monthly planning that turns good intentions into visible progress.", accent: "coral" },
];

const steps = [
  { title: "Connect your picture", text: "Add the income and expenses that shape your everyday life." },
  { title: "Find your rhythm", text: "Watch your balance, savings rate, and spending patterns become clear." },
  { title: "Move with intention", text: "Use small, informed decisions to make room for what matters." },
];

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("Hi, I am Folia Guide. Ask me about budgets, savings, or getting started.");
  const [contactSent, setContactSent] = useState(false);

  function handleChatSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chatMessage.trim()) return;
    setChatReply("Thanks for asking. Folia keeps guidance transparent and practical. Your workspace will help you explore that pattern with your own numbers.");
    setChatMessage("");
  }

  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Main navigation">
        <Link className="landing-brand" href="/" onClick={() => setIsMenuOpen(false)}><span className="landing-brand-mark">fa</span><span>folia</span></Link>
        <div className={`landing-nav-links ${isMenuOpen ? "landing-nav-links-open" : ""}`}>
          <a href="#why-folia" onClick={() => setIsMenuOpen(false)}>Why Folia</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it works</a>
          <a href="#insights" onClick={() => setIsMenuOpen(false)}>Insights</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
        </div>
        <div className="landing-nav-actions"><Link className="landing-signin" href="/login">Sign in</Link><Link className="landing-nav-cta" href="/register">Start free <span aria-hidden="true">{"->"}</span></Link></div>
        <button className="landing-menu-button" type="button" aria-label="Toggle navigation" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}><span /><span /><span /></button>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span className="eyebrow-dot" />Personal finance, made human</p>
          <h1>Make room for the life <em>you mean to live.</em></h1>
          <p className="landing-hero-lede">Folia is a clear, calm financial workspace for tracking what comes in, what goes out, and what you want next.</p>
          <div className="landing-hero-actions"><Link className="landing-primary-button" href="/register">Build your money map <span aria-hidden="true">{"->"}</span></Link><a className="landing-text-link" href="#how-it-works">See how it works <span aria-hidden="true">&#8595;</span></a></div>
          <div className="landing-proof"><div className="proof-avatars"><span>AK</span><span>NM</span><span>RS</span></div><p><strong>1,200+ thoughtful planners</strong><br />finding more clarity every month</p></div>
        </div>
        <div className="landing-hero-visual" aria-label="Folia financial overview preview">
          <div className="visual-note visual-note-top"><span className="visual-note-pin" aria-hidden="true" />your money, in focus</div>
          <div className="hero-dashboard-card">
            <div className="mini-card-header"><div><span className="mini-overline">September overview</span><strong>Good morning, Suvit.</strong></div><span className="mini-avatar">SK</span></div>
            <div className="mini-balance"><span>Available balance</span><strong>LKR 133,800</strong><small>+ 12.4% this month</small></div>
            <div className="mini-chart"><div className="mini-chart-labels"><span>cash in</span><span>cash out</span></div><svg viewBox="0 0 420 135" preserveAspectRatio="none" aria-hidden="true"><path className="mini-chart-grid" d="M0 25H420 M0 68H420 M0 111H420" /><path className="mini-line-green" d="M0 92 C35 84 44 53 78 68 S126 73 160 57 S209 34 244 48 S285 18 322 34 S377 25 420 14" /><path className="mini-line-coral" d="M0 113 C45 102 66 107 97 92 S145 96 180 84 S217 73 251 84 S301 60 339 74 S384 58 420 65" /></svg><div className="mini-chart-months"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div>
            <div className="mini-bottom-row"><div><span>Saving rate</span><strong>61.7%</strong></div><div><span>This month</span><strong className="mini-positive">On track</strong></div><div className="mini-spark">*</div></div>
          </div>
          <div className="visual-note visual-note-bottom"><span className="visual-star">*</span><span className="visual-note-copy">small steps<br />strong habits</span></div>
        </div>
      </section>

      <section className="landing-marquee" aria-label="Folia principles"><div>Track with clarity</div><span>*</span><div>Plan with intention</div><span>*</span><div>Grow with confidence</div><span>*</span><div>Track with clarity</div></section>

      <section className="landing-section landing-why" id="why-folia">
        <div className="section-intro"><p className="landing-eyebrow">A softer way to be practical</p><h2>Money should feel like a <em>conversation,</em> not a spreadsheet.</h2></div>
        <div className="feature-grid">{features.map((feature) => <article className={`feature-card feature-${feature.accent}`} key={feature.number}><span className="feature-number">{feature.number}</span><div className="feature-icon" aria-hidden="true">{feature.accent === "mint" ? "[]" : feature.accent === "lime" ? "+" : "*"}</div><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-arrow" aria-hidden="true">{"->"}</span></article>)}</div>
      </section>

      <section className="landing-section landing-process" id="how-it-works"><div className="process-heading"><p className="landing-eyebrow">A little more clarity, step by step</p><h2>Good with numbers.<br /><em>Great with humans.</em></h2><p>Folia is built for the real version of financial life: imperfect, changing, and full of possibility.</p></div><div className="process-list">{steps.map((step, index) => <div className="process-step" key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><i aria-hidden="true">{"->"}</i></div>)}</div></section>

      <section className="landing-section landing-insight-section" id="insights"><div className="insight-copy"><p className="landing-eyebrow">Not advice. A better starting point.</p><h2>Your numbers have a <em>story.</em></h2><p>Folia turns your activity into transparent observations, so you can see what is changing and choose what to do next. No predictions. No pressure. Just useful context.</p><Link className="landing-dark-button" href="/register">Find your pattern <span aria-hidden="true">{"->"}</span></Link></div><div className="quote-card"><span className="quote-mark">“</span><blockquote>Clarity is not having every answer. It is knowing which question to ask next.</blockquote><div className="quote-line"><span />Folia principle 01</div></div></section>

      <section className="landing-contact" id="contact"><div><p className="landing-eyebrow">Keep in touch</p><h2>Start where you are.<br /><em>We will meet you there.</em></h2></div><div className="contact-form-wrap">{contactSent ? <div className="contact-success"><span>*</span><h3>Thanks, you are on the list.</h3><p>We will send thoughtful updates your way.</p></div> : <form className="landing-contact-form" onSubmit={(event) => { event.preventDefault(); setContactSent(true); }}><label htmlFor="contact-email">Get occasional notes on building a better money life</label><div><input id="contact-email" type="email" placeholder="Your email address" required /><button type="submit" aria-label="Subscribe">{"->"}</button></div><small>No noise. Just useful things, occasionally.</small></form>}</div></section>

      <footer className="landing-footer"><div className="landing-footer-brand"><Link className="landing-brand" href="/"><span className="landing-brand-mark">fa</span><span>folia</span></Link><p>A calmer relationship<br />with your money.</p></div><div className="footer-links"><div><strong>Explore</strong><a href="#why-folia">Why Folia</a><a href="#how-it-works">How it works</a><a href="#insights">Insights</a></div><div><strong>Company</strong><a href="#contact">Contact</a><a href="/login">Sign in</a><a href="/register">Create account</a></div><div><strong>Social</strong><a href="#contact">Instagram</a><a href="#contact">LinkedIn</a><a href="#contact">Journal</a></div></div><div className="footer-bottom"><span>© 2026 Folia Finance</span><span>Built for a life well spent.</span><span>Colombo / Sri Lanka</span></div></footer>

      <div className={`landing-chat ${isChatOpen ? "landing-chat-open" : ""}`}><button className="chat-trigger" type="button" aria-label={isChatOpen ? "Close Folia Guide" : "Open customer support chat"} aria-expanded={isChatOpen} onClick={() => setIsChatOpen(!isChatOpen)}><span>{isChatOpen ? "x" : <span className="support-icon" aria-hidden="true"><i /><b /></span>}</span>{!isChatOpen && <i>1</i>}</button>{isChatOpen && <div className="chat-window"><div className="chat-window-header"><span className="chat-status" />Folia Guide<button type="button" aria-label="Close chat" onClick={() => setIsChatOpen(false)}>x</button></div><div className="chat-window-body"><p>{chatReply}</p><small>Educational guidance only.</small></div><form onSubmit={handleChatSubmit}><input value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} placeholder="Ask a question..." aria-label="Chat message" /><button type="submit" aria-label="Send message">{"->"}</button></form></div>}</div>
    </main>
  );
}
