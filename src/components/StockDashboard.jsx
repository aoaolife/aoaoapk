import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  DollarSign,
  Clock
} from 'lucide-react';

export default function StockDashboard() {
  const [marketStatus, setMarketStatus] = useState("Closed");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // 模拟数据：指数
  const [indices, setIndices] = useState([
    { name: '上证指数', value: 2865.90, change: 12.5, percent: 0.44 },
    { name: '深证成指', value: 8856.22, change: -45.2, percent: -0.51 },
    { name: '创业板指', value: 1726.88, change: -10.5, percent: -0.61 },
    { name: '恒生指数', value: 16589.44, change: 230.1, percent: 1.41 },
  ]);

  // 模拟数据：自选股
  const [stocks, setStocks] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, percent: 0.68, holding: 100 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 215.55, change: -5.40, percent: -2.44, holding: 50 },
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 596.54, change: 12.30, percent: 2.10, holding: 20 },
    { symbol: 'BABA', name: 'Alibaba', price: 74.20, change: 0.85, percent: 1.16, holding: 200 },
    { symbol: 'TCEHY', name: 'Tencent', price: 38.50, change: 0.40, percent: 1.05, holding: 300 },
    { symbol: 'MSFT', name: 'Microsoft', price: 402.56, change: 3.10, percent: 0.78, holding: 0 },
  ]);

  // 模拟实时价格变动
  useEffect(() => {
    const interval = setInterval(() => {
      // 更新指数
      setIndices(prev => prev.map(item => {
        const volatility = (Math.random() - 0.5) * 5; // 随机波动
        const newValue = item.value + volatility;
        const newChange = item.change + volatility;
        const newPercent = (newChange / (newValue - newChange)) * 100;
        return {
          ...item,
          value: newValue,
          change: newChange,
          percent: newPercent
        };
      }));

      // 更新股票
      setStocks(prev => prev.map(stock => {
        const volatility = (Math.random() - 0.5) * (stock.price * 0.005); // 0.5% 波动
        const newPrice = Math.max(0.01, stock.price + volatility);
        const newChange = stock.change + volatility;
        const newPercent = (newChange / (newPrice - newChange)) * 100;
        return {
          ...stock,
          price: newPrice,
          change: newChange,
          percent: newPercent
        };
      }));
      
      setLastUpdated(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 格式化数字
  const fmt = (num, digits=2) => num.toFixed(digits);
  const colorClass = (val) => val >= 0 ? "text-red-500" : "text-green-500"; // 中国股市红涨绿跌
  const bgClass = (val) => val >= 0 ? "bg-red-50" : "bg-green-50";

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
      {/* 顶部 Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center shadow-sm shrink-0">
        <div>
           <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <Activity className="text-blue-500" size={20}/>
             aoao.life
           </h1>
           <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
             <Clock size={10}/> 
             已更新: {lastUpdated.toLocaleTimeString()}
           </p>
        </div>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:rotate-180 transition-all">
          <RefreshCw size={18} className="text-gray-600" />
        </button>
      </div>

      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 指数卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {indices.map((idx, i) => (
            <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500 font-medium mb-1">{idx.name}</div>
              <div className={`text-lg font-bold ${colorClass(idx.change)}`}>
                {fmt(idx.value)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {idx.change >= 0 ? <TrendingUp size={12} className="text-red-500"/> : <TrendingDown size={12} className="text-green-500"/>}
                <span className={`text-xs font-medium ${colorClass(idx.change)}`}>
                  {idx.change >= 0 ? '+' : ''}{fmt(idx.change)} ({idx.change >= 0 ? '+' : ''}{fmt(idx.percent)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 资产概览 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
           <div className="flex justify-between items-start mb-2">
             <span className="text-blue-100 text-xs font-medium tracking-wider">总资产 (CNY)</span>
             <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <DollarSign size={14} className="text-white"/>
             </div>
           </div>
           <div className="text-3xl font-bold tracking-tight mb-1">
             ¥ 1,245,680.00
           </div>
           <div className="flex items-center gap-2 text-sm text-blue-100">
             <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold text-white">+2.4%</span>
             <span>今日盈亏 +¥2,350</span>
           </div>
        </div>

        {/* 自选股列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-700 text-sm">自选 / 持仓</h3>
            <button className="text-blue-500 text-xs font-medium flex items-center gap-0.5">
               <Plus size={12}/> 添加
            </button>
          </div>
          
          <div className="divide-y divide-gray-50">
            {stocks.map((stock, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">
                      {stock.symbol[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{stock.name}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="bg-gray-100 px-1 rounded">{stock.symbol}</span>
                        {stock.holding > 0 && <span className="text-orange-400">持仓 {stock.holding}</span>}
                      </div>
                    </div>
                 </div>
                 
                 <div className="text-right">
                    <div className="font-bold text-gray-800 text-sm">${fmt(stock.price)}</div>
                    <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${bgClass(stock.percent)} px-1.5 py-0.5 rounded mt-0.5 ${colorClass(stock.percent)}`}>
                       {stock.change >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                       {stock.change >= 0 ? '+' : ''}{fmt(stock.percent)}%
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部占位 */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}
