export const defaultQuiz = {
    createdAt: null,
    quizId: null,
    img: null,
    text: null,
    username: null,
    hintOne: null,
    hintTwo: null
}

export const defaultAnswer = {
    lat: null,
    lng: null,
    hood: "Theater District",
    borough: "Manhattan",
    streets: ["Broadway", "7th Ave", "W 46th St"],
    hintsUsed: 0
}

export const initialHomeState = {
    quiz: defaultQuiz,
    answer: defaultAnswer,
    hasAnswered: false,
    leaderboard: {
        count: 0,
        data: [{}, {}, {}, {}],
        isLoading: false
    },
    history: {
        count: 0,
        data: [{}, {}, {}, {}],
        isLoading: false
    },
    options: {
        hardMode: false,
        soundEffects: true,
        useMetric: false
    },
    stats: {
        attemps: 0,
        marginOfError: 0,
        percentage: 0,
        streak: 0
    }
}
