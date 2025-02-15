"use client";
import React from "react";

function ScoreBoard({
  currentScore = 0,
  gameMode = "classic",
  playerName = "",
}) {
  const [topScores, setTopScores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        const response = await fetch("/api/get-top-scores", {
          method: "POST",
          body: JSON.stringify({ gameMode }),
        });

        if (!response.ok) {
          throw new Error("Ошибка при загрузке рекордов");
        }

        const data = await response.json();
        if (data.success) {
          setTopScores(data.scores);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить таблицу рекордов");
      } finally {
        setLoading(false);
      }
    };

    fetchTopScores();
  }, [gameMode]);

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-[400px]">
        <p className="text-white font-roboto text-center">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-[400px]">
        <p className="text-red-500 font-roboto text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg w-[400px]">
      <div className="mb-6">
        <h2 className="text-2xl font-roboto text-white mb-2">Текущий счёт</h2>
        <div className="bg-[#2a2a2a] p-4 rounded-lg">
          <p className="text-4xl font-roboto text-[#4a90e2] text-center">
            {currentScore}
          </p>
          {playerName && (
            <p className="text-white font-roboto text-center mt-2">
              Игрок: {playerName}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-roboto text-white mb-2">
          Таблица рекордов
        </h2>
        <div className="bg-[#2a2a2a] p-4 rounded-lg">
          {topScores.length > 0 ? (
            <div className="space-y-2">
              {topScores.map((score, index) => (
                <div
                  key={score.id}
                  className="flex justify-between items-center text-white font-roboto p-2 rounded bg-[#333333]"
                >
                  <span>
                    #{index + 1} {score.player_name}
                  </span>
                  <span className="text-[#4a90e2]">{score.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white font-roboto text-center">Нет рекордов</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBoardStory() {
  return (
    <div className="p-8 flex flex-col items-center gap-8 bg-[#121212]">
      <ScoreBoard
        currentScore={1500}
        gameMode="classic"
        playerName="Игрок123"
      />

      <ScoreBoard currentScore={0} gameMode="arcade" />

      <ScoreBoard currentScore={750} gameMode="classic" />
    </div>
  );
}

export default ScoreBoard;