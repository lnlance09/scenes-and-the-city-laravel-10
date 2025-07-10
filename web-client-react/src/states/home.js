export const defaultQuiz = {
    id: null,
    img: null,
    hintOne: null,
    hintTwo: null,
    video: {
        title: null,
        year: null
    },
    char: {
        firstName: null,
        lastName: null,
        img: null
    },
    action: null,
    username: null,
    createdAt: null
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
    history: {
        answers: {
            count: 0,
            data: [{}, {}, {}, {}],
            isLoading: false
        },
        quizzes: {
            count: 0,
            data: [{}, {}, {}, {}],
            isLoading: false
        }
    }
}
