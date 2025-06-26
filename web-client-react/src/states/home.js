export const defaultQuiz = {
    createdAt: null,
    quizId: null,
    text: null,
    username: null
}

export const initialHomeState = {
    leaderboard: {
        count: 0,
        data: [{}, {}, {}, {}],
        isLoading: false
    },
    quiz: defaultQuiz,
    settings: {
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
}
