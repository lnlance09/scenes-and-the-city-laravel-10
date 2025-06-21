export const defaultQuiz = {
    id: null,
    answer: null,
    haveAnswered: false,
    hintOne: null,
    hineTwo: null,
    scene: {
        name: null,
        action: {
            name: null
        },
        char: {
            name: null,
            actor: {
                name: null
            }
        },
        video: {
            img: null,
            title: null,
            year: null
        }
    },
    user: {
        username: null
    }
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
