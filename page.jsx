"use client";
import React from "react";

function MainComponent() {
  const [blocks, setBlocks] = useState([]);
  const [nextBlocks, setNextBlocks] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [specialAbilityCharge, setSpecialAbilityCharge] = useState(100);
  const [playerName, setPlayerName] = useState("");
  const [gameMode] = useState("classic");
  const [difficulty, setDifficulty] = useState("medium");
  const [gridSize, setGridSize] = useState(10);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(100);
  const [bossAttackTimer, setBossAttackTimer] = useState(null);

  const getDifficultySettings = useCallback(() => {
    const baseSettings = {
      easy: {
        shapes: ["square", "line"],
        colors: ["#4a90e2", "#4ae24a"],
        specialAbilityRechargeTime: 8000,
        scoreMultiplier: 0.8,
      },
      hard: {
        shapes: ["square", "line", "tShape", "lShape", "zShape"],
        colors: ["#4a90e2", "#e24a4a", "#4ae24a", "#e2e24a", "#e24ae2"],
        specialAbilityRechargeTime: 12000,
        scoreMultiplier: 1.5,
      },
      medium: {
        shapes: ["square", "line", "tShape", "lShape"],
        colors: ["#4a90e2", "#e24a4a", "#4ae24a", "#e2e24a"],
        specialAbilityRechargeTime: 10000,
        scoreMultiplier: 1,
      },
    };

    const bossSettings = {
      yoniBego: {
        paintInterval: difficulty === "hard" ? 8000 : 12000,
        paintDuration: 15000,
      },
      baruchBosian: {
        moflettaInterval: difficulty === "hard" ? 10000 : 15000,
        affectedBlocks: difficulty === "hard" ? 4 : 2,
      },
      davidMoshe: {
        colorShiftInterval: difficulty === "hard" ? 12000 : 18000,
        blocksAffected: difficulty === "hard" ? 6 : 3,
      },
    };

    return {
      ...baseSettings[difficulty],
      bosses: bossSettings,
    };
  }, [difficulty]);

  const generateBlock = useCallback(() => {
    const settings = getDifficultySettings();
    return {
      id: Math.random().toString(36).substr(2, 9),
      shape:
        settings.shapes[Math.floor(Math.random() * settings.shapes.length)],
      color:
        settings.colors[Math.floor(Math.random() * settings.colors.length)],
      isPainted: false,
    };
  }, [getDifficultySettings]);

  const generateNextBlocks = useCallback(() => {
    return Array.from({ length: 3 })
      .fill(null)
      .map(() => generateBlock());
  }, [generateBlock]);

  useEffect(() => {
    if (nextBlocks.length === 0) {
      setNextBlocks(generateNextBlocks());
    }
  }, [nextBlocks, generateNextBlocks]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const difficultyParam = params.get("difficulty") || "medium";
    const gridSizeParam = parseInt(params.get("gridSize")) || 10;
    setDifficulty(difficultyParam);
    setGridSize(gridSizeParam);
  }, []);

  const handleBossEffect = useCallback(
    (effect) => {
      switch (effect.type) {
        case "paint":
          setBlocks((currentBlocks) =>
            currentBlocks.map((block) => ({
              ...block,
              isPainted: effect.positions.some(
                (pos) => pos.x === block.x && pos.y === block.y
              ),
            }))
          );
          break;
        case "mofletta":
          setBlocks((currentBlocks) =>
            currentBlocks.filter(
              (block) =>
                !effect.positions.some(
                  (pos) => pos.x === block.x && pos.y === block.y
                )
            )
          );
          break;
        case "colorShift":
          const settings = getDifficultySettings();
          setBlocks((currentBlocks) =>
            currentBlocks.map((block) =>
              effect.positions.some(
                (pos) => pos.x === block.x && pos.y === block.y
              )
                ? {
                    ...block,
                    color:
                      settings.colors[
                        Math.floor(Math.random() * settings.colors.length)
                      ],
                  }
                : block
            )
          );
          break;
      }
    },
    [getDifficultySettings]
  );

  const handleBossDefeat = async (bossId) => {
    try {
      const newScore = score + 5000;
      setScore(newScore);
      await fetch("/api/save-score", {
        method: "POST",
        body: JSON.stringify({
          playerName,
          score: newScore,
          gameMode,
          bossDefeated: bossId,
        }),
      });
    } catch (error) {
      console.error("Ошибка при сохранении победы над боссом:", error);
    }
  };

  const handleBlocksUpdate = useCallback(
    async (updatedBlocks) => {
      const clearedCount = blocks.length - updatedBlocks.length;
      if (clearedCount > 0) {
        const settings = getDifficultySettings();
        const newScore = Math.round(
          score + clearedCount * 100 * settings.scoreMultiplier
        );
        setScore(newScore);

        if (currentBoss) {
          const damage = clearedCount * 10;
          const newHealth = Math.max(0, bossHealth - damage);
          setBossHealth(newHealth);

          if (newHealth === 0) {
            await handleBossDefeat(currentBoss.id);
            setCurrentBoss(null);
            clearInterval(bossAttackTimer);
          }
        }

        if (isSoundOn) {
          const audio = new Audio("/sounds/clear.mp3");
          audio.play();
        }

        try {
          await fetch("/api/save-score", {
            method: "POST",
            body: JSON.stringify({ playerName, score: newScore, gameMode }),
          });
        } catch (error) {
          console.error("Ошибка при сохранении счета:", error);
        }
      }
      setBlocks(updatedBlocks);
    },
    [
      blocks,
      score,
      playerName,
      gameMode,
      isSoundOn,
      getDifficultySettings,
      currentBoss,
      bossHealth,
      bossAttackTimer,
    ]
  );

  const handleSpecialAbility = useCallback(() => {
    if (specialAbilityCharge === 100) {
      setSpecialAbilityCharge(0);
      const newBlocks = blocks.filter((_, index) => index < blocks.length - 5);
      setBlocks(newBlocks);
      const settings = getDifficultySettings();
      setTimeout(
        () => setSpecialAbilityCharge(100),
        settings.specialAbilityRechargeTime
      );

      if (isSoundOn) {
        const audio = new Audio("/sounds/special.mp3");
        audio.play();
      }
    }
  }, [blocks, specialAbilityCharge, isSoundOn, getDifficultySettings]);

  const handleRestart = useCallback(() => {
    setBlocks([]);
    setNextBlocks(generateNextBlocks());
    setScore(0);
    setGameOver(false);
    setSpecialAbilityCharge(100);
    setCurrentBoss(null);
    setBossHealth(100);
    if (bossAttackTimer) {
      clearInterval(bossAttackTimer);
    }

    if (isSoundOn) {
      const audio = new Audio("/sounds/restart.mp3");
      audio.play();
    }
  }, [generateNextBlocks, isSoundOn, bossAttackTimer]);

  const handleSoundToggle = useCallback(() => {
    setIsSoundOn(!isSoundOn);
  }, [isSoundOn]);

  const handleChangeDifficulty = useCallback(() => {
    window.location.href = "/block-blast-online/difficulty";
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-roboto p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Block Blast Online</h1>
          <p className="text-gray-400">
            Перетащите блоки на сетку, чтобы создать полные ряды или столбцы.
            Собирайте очки и побейте рекорд!
          </p>
          <div className="mt-2 text-[#4a90e2]">
            Сложность:{" "}
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} | Размер
            сетки: {gridSize}x{gridSize}
          </div>
        </header>

        {currentBoss && (
          <div className="fixed top-4 right-4 bg-[#1a1a1a] p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={`/bosses/${currentBoss.id}.png`}
                alt={currentBoss.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold">{currentBoss.name}</h3>
                <div className="w-48 h-2 bg-[#2a2a2a] rounded-full mt-2">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${bossHealth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
          <div className="flex flex-col gap-4">
            <GameGrid
              blocks={blocks}
              onBlocksUpdate={handleBlocksUpdate}
              gridSize={gridSize}
            />

            <GameControls
              onRestart={handleRestart}
              onSoundToggle={handleSoundToggle}
              onSpecialAbility={handleSpecialAbility}
              onChangeDifficulty={handleChangeDifficulty}
              isSoundOn={isSoundOn}
              specialAbilityCharge={specialAbilityCharge}
              isSpecialAbilityReady={specialAbilityCharge === 100}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <h2 className="text-xl mb-4">Следующие блоки:</h2>
              <div className="flex flex-col gap-4">
                {nextBlocks.map((block) => (
                  <BlockPiece
                    key={block.id}
                    shape={block.shape}
                    color={block.color}
                  />
                ))}
              </div>
            </div>

            <ScoreBoard
              currentScore={score}
              gameMode={gameMode}
              playerName={playerName}
            />
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#1a1a1a] p-8 rounded-lg text-center">
            <h2 className="text-2xl mb-4">Игра окончена!</h2>
            <p className="mb-4">Ваш счет: {score}</p>
            <input
              type="text"
              placeholder="Введите ваше имя"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-[#2a2a2a] text-white p-2 rounded mb-4 w-full"
            />
            <button
              onClick={handleRestart}
              className="bg-[#4a90e2] hover:bg-[#357abd] text-white px-6 py-2 rounded-lg"
            >
              Играть снова
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes blockPlace {
          from { transform: scale(1.2); opacity: 0.5; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes rowClear {
          from { transform: scale(1); }
          50% { transform: scale(1.1); }
          to { transform: scale(0); }
        }

        @keyframes scoreUpdate {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-20px); opacity: 0; }
        }

        @keyframes blockAppear {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default MainComponent;