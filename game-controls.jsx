"use client";
import React from "react";

function GameControls({
  onRestart,
  onSoundToggle,
  onSpecialAbility,
  isSoundOn = true,
  specialAbilityCharge = 100,
  isSpecialAbilityReady = true,
}) {
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg w-[400px]">
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={onRestart}
          className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-roboto px-4 py-2 rounded-lg inline-block transition-colors"
        >
          <i className="fas fa-redo-alt mr-2"></i>
          Перезапуск
        </button>

        <button
          onClick={onSoundToggle}
          className="bg-[#2a2a2a] hover:bg-[#333333] text-white font-roboto px-4 py-2 rounded-lg inline-block transition-colors"
        >
          <i
            className={`fas ${
              isSoundOn ? "fa-volume-up" : "fa-volume-mute"
            } mr-2`}
          ></i>
          {isSoundOn ? "Звук вкл." : "Звук выкл."}
        </button>

        <div className="relative">
          <button
            onClick={onSpecialAbility}
            disabled={!isSpecialAbilityReady}
            className={`
              bg-[#e24a4a] hover:bg-[#c73d3d] text-white font-roboto px-4 py-2 rounded-lg inline-block
              transition-colors relative overflow-hidden
              ${!isSpecialAbilityReady ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <i className="fas fa-bolt mr-2"></i>
            Способность
            <div
              className="absolute bottom-0 left-0 h-1 bg-[#ffd700]"
              style={{ width: `${specialAbilityCharge}%` }}
            ></div>
          </button>
        </div>
      </div>
    </div>
  );
}

function GameControlsStory() {
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [specialAbilityCharge, setSpecialAbilityCharge] = useState(100);

  const handleRestart = () => {
    console.log("Игра перезапущена");
  };

  const handleSoundToggle = () => {
    setIsSoundOn(!isSoundOn);
  };

  const handleSpecialAbility = () => {
    setSpecialAbilityCharge(0);
    setTimeout(() => setSpecialAbilityCharge(100), 3000);
  };

  return (
    <div className="p-8 flex flex-col gap-8 bg-[#121212]">
      <GameControls
        onRestart={handleRestart}
        onSoundToggle={handleSoundToggle}
        onSpecialAbility={handleSpecialAbility}
        isSoundOn={isSoundOn}
        specialAbilityCharge={specialAbilityCharge}
        isSpecialAbilityReady={specialAbilityCharge === 100}
      />

      <GameControls
        onRestart={handleRestart}
        onSoundToggle={handleSoundToggle}
        onSpecialAbility={handleSpecialAbility}
        isSoundOn={false}
        specialAbilityCharge={50}
        isSpecialAbilityReady={false}
      />

      <GameControls
        onRestart={handleRestart}
        onSoundToggle={handleSoundToggle}
        onSpecialAbility={handleSpecialAbility}
        isSoundOn={true}
        specialAbilityCharge={0}
        isSpecialAbilityReady={false}
      />
    </div>
  );
}

export default GameControls;