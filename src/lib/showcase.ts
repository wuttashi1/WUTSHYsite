export type DemoId = "food" | "fitness" | "dota" | "voice" | "anime" | "spatial";
export const showcase: { id: DemoId; title: string; platform: string; description: string; repo: string; icon: string; color: string; tags: string[]; liveUrl?: string; screenshots?: { url: string; caption: string }[] }[] = [
  { id: "food", title: "Food Planner", platform: "Telegram", description: "Weekly meals, shared shopping lists and a little less everyday chaos.", repo: "food-planner-bot", icon: "🥑", color: "#dcfce7", tags: ["Python", "aiogram", "SQLite", "Docker"], liveUrl: "https://t.me/wutshyfoodplanner_bot" },
  { id: "fitness", title: "Fitness Bot", platform: "Telegram", description: "Personal programs, guided workouts and progress you can follow.", repo: "fitness-bot-mvp", icon: "⚡", color: "#fef3c7", tags: ["Python", "aiogram", "SQLite"], liveUrl: "https://t.me/TrenirovkaWSBot" },
  { id: "dota", title: "DotaAccept", platform: "Windows + Telegram", description: "Accept a match and run your hero profile from a hotkey or Telegram.", repo: "DotaAccept", icon: "↗", color: "#ffe4e6", tags: ["Windows", "WebView2", "Telegram"], screenshots: ["home", "telegram", "settings", "history"].map(name => ({url: `https://raw.githubusercontent.com/wuttashi1/DotaAccept/main/docs/screenshots/${name}.png`, caption: `DotaAccept / ${name}`})) },
  { id: "voice", title: "Voice Control", platform: "Discord", description: "One panel. Your voice channel. Mute and unmute with administrator controls.", repo: "dsmuterwutshy", icon: "◉", color: "#e0e7ff", tags: ["Python", "Discord API"] },
  { id: "anime", title: "Anime Wutshy", platform: "Discord", description: "Anime cards, personal lists and forum discussions in your community.", repo: "animewutshybot", icon: "✦", color: "#fce7f3", tags: ["Python", "Jikan", "YummyAnime"] },
  { id: "spatial", title: "Spatial HandGUI", platform: "Minecraft / Fabric", description: "An inventory in the palm of your hand. A first-person Spatial GUI add-on.", repo: "spatial-handgui", icon: "▦", color: "#cffafe", tags: ["Java", "Fabric", "Minecraft"], screenshots: [{url: "https://raw.githubusercontent.com/wuttashi1/spatial-handgui/main/assets/handgui-screenshot.png", caption: "Spatial HandGUI / Minecraft"}] },
];

export const demoFlows: Record<Exclude<DemoId, "spatial">, { welcome: string; actions: { label: string; reply: string }[] }> = {
  food: { welcome: "Welcome to Food Planner 🥑\nYour meals and shopping list, together. What shall we plan?", actions: [
    { label: "Today's menu", reply: "MONDAY 🍽\nBreakfast · Oatmeal with banana\nLunch · Chicken, rice and vegetables\nDinner · Vegetable omelette\n\nSample menu · one person's portion" },
    { label: "Shopping list", reply: "SHOPPING LIST 🛒\n☐ Oats · 80 g\n☐ Banana · 1\n☐ Chicken · 150 g\n☐ Rice · 80 g\n☐ Eggs · 2\n☐ Vegetables · 300 g" },
    { label: "Weekly plan", reply: "YOUR WEEK 📅\nMon · Chicken & rice\nTue · Pasta & vegetables\nWed · Fish & potatoes\nThu · Lentil soup\nFri · Chicken & buckwheat\nSat · Vegetable curry\nSun · Homemade pizza\n\nIllustrative demo menu" },
  ] },
  fitness: { welcome: "Ready for your next session? ⚡\nChoose a workout, record a set or explore your progress.", actions: [
    { label: "Start workout", reply: "WORKOUT A 💪\n1. Squat · 3 × 8\n2. Bench press · 3 × 10\n3. Row · 3 × 10\n\nFirst exercise: Squat\nRecord your first set below." },
    { label: "Record a set", reply: "SET RECORDED ✓\nSquat · 40 kg × 8 · RIR 2\nRest: 90 seconds\n\nSample set saved in this demo session." },
    { label: "My progress", reply: "TRAINING JOURNAL 📈\nLatest session · Workout A\nPersonal record · Squat 40 kg × 8\n\nIllustrative sample history" },
  ] },
  dota: { welcome: "DotaAccept · Control panel\nDemo PC connected. Choose an action to send to the desktop app.", actions: [
    { label: "Accept match", reply: "ACTION SENT ✓\nThe configured accept action was executed on the demo PC.\n\nStarted manually, just like F6 in the application." },
    { label: "Hero profile", reply: "HERO PROFILE 🎮\nSample profile selected. The recorded click sequence has been executed.\n\nDesktop shortcut: F7" },
    { label: "Stop action", reply: "STOPPED ⏹\nThe current action has been stopped.\n\nDesktop shortcut: F8" },
  ] },
  voice: { welcome: "/voicecontrol\nVoice channel: Studio\nDemo role: Administrator\n\nControl the members of your current voice channel.", actions: [
    { label: "Mute All", reply: "MEMBERS MUTED 🔇\nWUTSHY · muted\nAlex · muted\nSam · muted\n\nAdministrator permission checked in the real bot." },
    { label: "Unmute All", reply: "MEMBERS UNMUTED 🔊\nWUTSHY · speaking enabled\nAlex · speaking enabled\nSam · speaking enabled" },
  ] },
  anime: { welcome: "Welcome to the anime corner ✦\nExplore an anime card, build your list and open a discussion.", actions: [
    { label: "Anime card", reply: "COWBOY BEBOP ✦\nTV · 26 episodes · 1998\nA crew of bounty hunters travels through space.\n\nSample card · the real bot uses anime APIs." },
    { label: "Add to my list", reply: "ADDED TO YOUR LIST ✓\nCowboy Bebop\nStatus · Plan to watch\n\nSaved for this demo session." },
    { label: "Forum topic", reply: "# Cowboy Bebop\nA place for your community's discussion.\n\nDemo topic opened. The real bot manages Discord forum topics." },
  ] },
};
