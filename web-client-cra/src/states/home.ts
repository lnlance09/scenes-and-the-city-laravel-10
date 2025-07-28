import { InitialHomeState } from "../interfaces"

export const defaultQuiz = {
    id: null,
    img: null,
    geoData: null,
    hintOne: null,
    hintTwo: null,
    youtubeId: null,
    video: {
        title: null,
        year: null,
        img: null
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

export const geoData = {
    lat: null,
    lng: null,
    hood: "Theater District",
    borough: "Manhattan",
    streets: ["Broadway", "7th Ave", "W 46th St"]
}

export const defaultAnswer = {
    correct: null,
    geoData,
    hasAnswered: false,
    hintsUsed: 0,
    marginOfError: null
}

export const defaultHistoryData = {
    count: 4,
    data: [{}, {}, {}, {}],
    isLoading: true
}

export const initialHomeState: InitialHomeState = {
    quiz: defaultQuiz,
    partTwo: null,
    answers: [defaultAnswer],
    history: {
        answers: defaultHistoryData,
        quizzes: defaultHistoryData
    }
}
