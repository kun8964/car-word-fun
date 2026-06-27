import { VEHICLES } from '../vehicleData';
import { assetUrl } from '../constants';
import { useGame } from '../context/GameContext';

export function RewardModal() {
  const { showReward, setShowReward, showAllCollected, setShowAllCollected, language } = useGame();

  if (showReward) {
    const rewardVehicle = VEHICLES.find((v) => v.id === showReward);
    if (!rewardVehicle) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
          <img src={assetUrl(rewardVehicle.image)} alt={rewardVehicle.name} className="mx-auto h-40 object-contain" />
          <h2 className="mt-4 text-2xl font-extrabold">{language === 'zh' ? '获得了新卡牌！' : 'New Card!'}</h2>
          <p className="mt-2 text-lg font-bold">{rewardVehicle.name}</p>
          <button
            className="mt-6 rounded-full bg-[#202A36] px-8 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-transform active:scale-95"
            type="button"
            onClick={() => setShowReward(null)}
          >
            {language === 'zh' ? '继续游戏' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  if (showAllCollected) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-extrabold">{language === 'zh' ? '已收集全部车辆！' : 'All vehicles collected!'}</h2>
          <p className="mt-2 opacity-60">{language === 'zh' ? '太厉害了！' : 'Amazing!'}</p>
          <button
            className="mt-6 rounded-full bg-[#202A36] px-8 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-transform active:scale-95"
            type="button"
            onClick={() => setShowAllCollected(false)}
          >
            {language === 'zh' ? '继续游戏' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
