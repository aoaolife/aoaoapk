import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  BarChart3, 
  User,
  Bell,
  Menu,
  Home,
  HelpCircle,
  X,
  Info,
  Clock,
  Link as LinkIcon,
  Heart,
  Globe,
  Server,
  Database,
  Terminal,
  Code,
  FileText,
  Settings,
  Cloud,
  ChevronLeft,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import StockDashboard from './components/StockDashboard';
import { Browser } from '@capacitor/browser';
import emuskIcon from './assets/emusk.cn.png';
import aoaoPublishIcon from './assets/x.png';
import aoaoDCIcon from './assets/dc.png';
import aoaoLifeIcon from './assets/aoao.life.png';
import aoaoStockIcon from './assets/aoaostock.png';

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  // 新增：控制当前显示的网页 URL
  const [browserUrl, setBrowserUrl] = useState(null);

  // 底部导航配置
  const TABS = [
    { id: 0, label: "aoao", icon: Home },
    { id: 2, label: "aoaoDC", icon: aoaoDCIcon },
    { id: 1, label: "emusk.cn", icon: emuskIcon },
    { id: 3, label: "aoao股票", icon: aoaoStockIcon },
    { id: 4, label: "我的", icon: User },
  ];

  // 处理底部导航点击
  const handleTabClick = async (index) => {
    if (index === 1) {
      // 商城改成 emusk.cn
      await Browser.open({ url: 'https://emusk.cn' });
    } else if (index === 2) {
      // aoaoDC
      await Browser.open({ url: 'https://dc.aoao.life' });
    } else {
      setActiveIndex(index);
      setBrowserUrl(null);
    }
  };

  // 处理首页应用点击
  const handleAppLaunch = async (appId) => {
    if (appId === 'monitor') {
      // 服务器监控改成 emusk.cn
      await Browser.open({ url: 'https://emusk.cn' });
    } else if (appId === 'web') {
      // 使用 Capacitor 原生浏览器打开，解决 iframe 拦截问题
      await Browser.open({ 
        url: 'https://aoao.life',
        toolbarColor: '#2C3E50'
      });
    } else if (appId === 'aoao_stock') {
      // aoao股票
      await Browser.open({ url: 'https://stock.aoao.life' });
    } else if (appId === 'aoao_publish') {
      // aoao发布
      await Browser.open({ url: 'https://x.aoao.life' });
    } else if (appId === 'aoao_dc') {
      // aoaoDC
      await Browser.open({ url: 'https://dc.aoao.life' });
    }
    // 其他应用可以添加更多逻辑
  };

  // 处理浏览器内的关闭/返回
  const handleCloseBrowser = () => {
    setBrowserUrl(null);
    if (activeIndex === 1) {
      setActiveIndex(0);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#2C3E50] overflow-hidden select-none">
      
      {/* 1. [顶部栏已移除] - 状态栏占位以支持沉浸式 */}
      <div className="pt-safe-top"></div>

      {/* 2. [中间内容] - 占据剩余空间 */}
      <div className="flex-1 bg-[#2C3E50] overflow-hidden relative custom-scrollbar flex flex-col">
        {browserUrl ? (
          <div className="flex-1 bg-white relative flex flex-col">
             <iframe 
               id="webview-frame"
               src={browserUrl} 
               className="flex-1 w-full h-full border-0"
               title="WebView"
               sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
             />
          </div>
        ) : (
          /* 场景 B: 原生界面 */
          <>
            {activeIndex === 0 ? (
              <div className="overflow-y-auto h-full pb-safe-bottom">
                <HomeDashboard onLaunch={handleAppLaunch} />
              </div>
            ) : activeIndex === 3 ? (
              <StockDashboard />
            ) : (
              <div className="bg-[#2C3E50] p-8 flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Wrench size={40} className="text-white/20" />
                </div>
                <p>功能开发中...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. [底部导航栏] - 主题色适配 */}
      {!browserUrl && (
        <div className="bg-[#1a2634] border-t border-white/5 pb-safe-bottom pt-2 shrink-0 z-50">
          <div className="flex justify-around items-center h-14">
            {TABS.map((tab, index) => {
              const isActive = activeIndex === tab.id; // Using tab.id for active state check, matching previous logic adjustment intent
              return (
                <button 
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="flex flex-col items-center justify-center w-full h-full active:scale-90 transition-transform"
                >
                  <div className={`
                    mb-0.5 rounded-full px-4 py-0.5 transition-colors duration-200
                    ${isActive ? 'bg-[#33ff00]/10' : 'bg-transparent'}
                  `}>
                    {typeof tab.icon === 'string' ? (
                       <img src={tab.icon} alt={tab.label} className={`w-[22px] h-[22px] object-contain ${isActive ? '' : 'opacity-40'}`} />
                    ) : (
                       <tab.icon 
                         size={22} 
                         className={isActive ? 'text-[#33ff00]' : 'text-white/40'} 
                         strokeWidth={isActive ? 2.5 : 2}
                       />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 255, 0, 0.2); border-radius: 2px; }
        
        /* Safe Area Support */
        .pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }
        .pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}</style>

    </div>
  );
}

// ==========================================
// 首页聚合组件 (Dashboard)
// ==========================================
function HomeDashboard({ onLaunch }) {
  // 模拟的应用站点数据
  const APPS = [
    { id: 'monitor', name: 'emusk.cn', icon: emuskIcon, color: 'bg-blue-500' },
    { id: 'web', name: 'aoao.life', icon: aoaoLifeIcon, color: 'bg-orange-500' },
    { id: 'aoao_stock', name: 'aoao股票', icon: aoaoStockIcon, color: 'bg-green-600' },
    { id: 'aoao_publish', name: 'aoao发布', icon: aoaoPublishIcon, color: 'bg-gray-700' },
    { id: 'aoao_dc', name: 'aoaoDC', icon: aoaoDCIcon, color: 'bg-cyan-500' },
    { id: 'git', name: '代码仓库', icon: Code, color: 'bg-purple-600' },
    { id: 'settings', name: '系统设置', icon: Settings, color: 'bg-slate-600' },
    { id: 'db', name: '数据库管理', icon: Database, color: 'bg-pink-500' },
  ];

  return (
    <div className="pb-8">
      {/* 上半部分：生命倒计时看板 */}
      <div className="mb-6 pt-4">
        <LifeCountdownWidget />
      </div>

      {/* 下半部分：站点方块矩阵 */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[#33ff00] font-bold text-sm tracking-wider opacity-80">
            aoao数据中心
          </h3>
          <button className="text-xs text-white/50 hover:text-[#33ff00]">管理</button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {APPS.map((app) => (
            <button 
              key={app.id}
              onClick={() => onLaunch && onLaunch(app.id)}
              className="aspect-square bg-gray-800/50 backdrop-blur rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 hover:border-[#33ff00]/50 active:scale-95 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${app.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                {typeof app.icon === 'string' ? (
                   <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                   <app.icon size={20} strokeWidth={2} />
                )}
              </div>
              <span className="text-[10px] text-gray-300 font-medium truncate w-full text-center px-1">
                {app.name}
              </span>
            </button>
          ))}
          
          {/* 添加按钮 */}
          <button className="aspect-square bg-transparent rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-[#33ff00]/50 hover:text-[#33ff00] text-white/30 transition-all">
             <div className="text-2xl font-light leading-none mb-1">+</div>
             <span className="text-[10px]">添加</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 简化版生命倒计时组件 (Widget)
// ==========================================
function LifeCountdownWidget() {
  const [userData] = useState({ name: '用户', year: 1984, month: 9, day: 23 });
  const [stats, setStats] = useState({
    years: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
    processedBeats: 0, remainingBeats: 0,
    yearPercent: 0, yearDaysLeft: 0,
    lifePercent: 0, lifeDaysLeft: 0
  });
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const dob = new Date(userData.year, userData.month - 1, userData.day);
    const birthTs = dob.getTime();
    const targetDate = new Date(birthTs);
    targetDate.setFullYear(dob.getFullYear() + 80);
    const targetTs = targetDate.getTime();
    const totalLifeSpan = targetTs - birthTs;
    const totalBeats = 3000000000;

    const timerInterval = setInterval(() => {
      const now = new Date();
      const nowTs = now.getTime();
      const distance = targetTs - nowTs;

      if (distance < 0) return;
      
      const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
      const yearsLeft = Math.floor(distance / msPerYear);
      const daysLeft = Math.floor((distance % msPerYear) / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minsLeft = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secsLeft = Math.floor((distance % (1000 * 60)) / 1000);

      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
      const elapsedYear = now - startOfYear;
      const totalYear = endOfYear - startOfYear;
      const yearPct = (elapsedYear / totalYear) * 100;
      const daysLeftInYear = Math.floor((endOfYear - now) / (1000 * 60 * 60 * 24));

      const msPerDay = 1000 * 60 * 60 * 24;
      const daysLived = Math.floor((nowTs - birthTs) / msPerDay);
      const totalLifeDays = 30000;
      const daysLeft30k = totalLifeDays - daysLived;
      const lifePct = Math.min(100, Math.max(0, (daysLived / totalLifeDays) * 100));

      const timeLeft = targetTs - nowTs;
      const ratio = timeLeft / totalLifeSpan;
      const remainingBeats = Math.floor(totalBeats * ratio);
      const processedBeats = totalBeats - remainingBeats;

      setStats({
        years: yearsLeft, days: daysLeft, hours: hoursLeft, minutes: minsLeft, seconds: secsLeft,
        processedBeats, remainingBeats,
        yearPercent: yearPct, yearDaysLeft: daysLeftInYear,
        lifePercent: lifePct, lifeDaysLeft: daysLeft30k
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [userData]);

  useEffect(() => {
    const beat = () => {
      setPulseScale(1.15);
      setTimeout(() => setPulseScale(1), 150);
      const nextBeat = 800 + Math.random() * 200;
      setTimeout(beat, nextBeat);
    };
    const timer = setTimeout(beat, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full px-4">
      
      <div className="text-center mb-6 mt-2">
          <p className="text-[#33ff00] text-2xl font-bold font-mono tracking-wider drop-shadow-md">
            今天是 {new Date().toLocaleDateString('zh-CN').replace(/\//g, '.')}
          </p>
      </div>
      
      <div className="w-full mb-3 relative group">
        <div className="w-full bg-[#1a2634] rounded-full h-8 overflow-hidden border border-white/5 relative shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-1000 absolute top-0 left-0" 
              style={{ 
                width: `${stats.yearPercent}%`,
                background: 'linear-gradient(90deg, #002FA7, #008C8C, #F7E14D, #81D8D0)'
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-end pr-3 z-10">
               <span className="text-[10px] text-white font-bold font-mono tracking-tight drop-shadow-md">
                  今年剩 {stats.yearDaysLeft} 天 ({stats.yearPercent.toFixed(1)}%)
               </span>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full z-20 shadow-lg scale-75 border border-white/20"></div>
        </div>
      </div>

      <div className="w-full mb-6 relative group">
        <div className="w-full bg-[#1a2634] rounded-full h-8 overflow-hidden border border-white/5 relative shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-1000 absolute top-0 left-0" 
              style={{ 
                width: `${stats.lifePercent}%`,
                background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)'
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-center z-10 px-2">
              <span className="text-[10px] text-white font-bold font-mono tracking-tight drop-shadow-md">
                  人生剩 {stats.lifeDaysLeft} 天 ({stats.lifePercent.toFixed(0)}%)
              </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 w-full mb-6">
        {[
          { val: stats.years, label: '年', color: 'text-blue-600' },
          { val: stats.days, label: '天', color: 'text-teal-500' },
          { val: stats.hours, label: '时', color: 'text-yellow-400' },
          { val: stats.minutes, label: '分', color: 'text-cyan-400' },
          { val: stats.seconds, label: '秒', color: 'text-red-500' },
        ].map((item, i) => (
          <div key={i} className="bg-[#15202b] border border-white/5 aspect-[4/5] rounded-xl flex flex-col items-center justify-center shadow-lg">
              <div className={`text-xl font-bold font-mono ${item.color}`}>
                {item.val.toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="w-full mb-2 relative flex justify-center pb-4 border-b border-white/5">
        <div 
          className="relative w-44 h-44 flex items-center justify-center transition-transform duration-150 ease-out"
          style={{ transform: `scale(${pulseScale})` }}
        >
            <Heart 
              size={160} 
              className="text-transparent stroke-[#33ff00] stroke-[2] drop-shadow-[0_0_15px_rgba(51,255,0,0.6)]" 
              fill="rgba(51, 255, 0, 0.1)"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none" style={{ transform: `scale(${1/pulseScale})` }}>
              <span className="text-[10px] text-white/70 font-medium tracking-wider mb-1">
                总30亿
              </span>
              <span className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] font-mono leading-none mb-1 tracking-tight">
                {stats.processedBeats.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-white font-mono tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-1">
                余 {(stats.remainingBeats).toLocaleString()}
              </span>
            </div>
        </div>
      </div>

    </div>
  );
}
