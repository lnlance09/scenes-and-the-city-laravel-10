export const defaultQuiz = {
    createdAt: null,
    quizId: null,
    img: null,
    text: null,
    username: null
}

export const initialHomeState = {
    quiz: defaultQuiz,
    answer: {
        lat: null,
        lng: null,
        hood: null,
        borough: null,
        description: null
    },
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
