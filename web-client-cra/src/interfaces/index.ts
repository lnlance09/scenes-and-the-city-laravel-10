export type Nullable<T> = T | null

export type Language = "en" | "es" | "cn"

export type Units = "miles" | "kilometers"

export interface ClassNames {
    [key: string]: boolean | 0 | 1
}

export interface UnitsUpdate {
    [key: string]: string
}

export type DropdownItem = {
    key: string
    text: string
    value: string
}

export type LocationPoint = {
    lat: number
    lng: number
}

export type User = {
    username: string
    points?: number
    settings?: Setting
}

export type Setting = {
    darkMode: number
    hardMode: number
    lang: string
    measureUnits: string
    revealAnswers: number
}

export type ForgotPasswordPayload = {
    email?: string
    username?: string
}

export type LoginPayload = {
    email?: string
    username?: string
    password: string
}

export type RegisterPayload = {
    email: string
    username: string
    password: string
}

export type VerificationPayload = {
    code: string
}

export type CharPicPayload = {
    file: string | Blob
    charId: string
}

export type GeoData = {
    lat: Nullable<number>
    lng: Nullable<number>
    hood: Nullable<string>
    borough: Nullable<string>
    streets: string[]
}

export type Quiz = {
    id: string
    img: string
    geoData: GeoData
    hintOne: Nullable<string>
    hintTwo: Nullable<string>
    youtubeId: Nullable<string>
    video: {
        title: string
        year: number
        img: string
    }
    char: {
        firstName: string
        lastName: string
        img: string
    }
    action: string
    distance?: number
    username: string
    createdAt: string
}

export type DefaultQuiz = {
    id: Nullable<string>
    img: Nullable<string>
    geoData: Nullable<GeoData>
    hintOne: Nullable<string>
    hintTwo: Nullable<string>
    youtubeId: Nullable<string>
    video: {
        title: Nullable<string>
        year: Nullable<number>
        img: Nullable<string>
    }
    char: {
        firstName: Nullable<string>
        lastName: Nullable<string>
        img: Nullable<string>
    }
    action: Nullable<string>
    distance?: Nullable<number>
    username: Nullable<string>
    createdAt: Nullable<string>
}

export type DefaultAnswer = {
    correct: Nullable<number>
    geoData: GeoData
    hasAnswered: boolean
    hintsUsed: number
    marginOfError: Nullable<number>
}

export interface Answer {
    correct: number
    geoData: GeoData
    hasAnswered: boolean
    hintsUsed: number
    marginOfError: number
    createdAt: string
}

export interface AnswerWithQuiz extends Answer {
    quiz: Quiz
}

export type DefaultHistoryData = {
    count: number
    data: any[]
    isLoading: boolean
}

export type DefaultAction = {
    id: Nullable<number>
    key: Nullable<string>
    name: Nullable<string>
    text: Nullable<string>
    value: Nullable<string>
}

export type Action = {
    id: number
    key: string
    name: string
    text: string
    value: string
}

export type DefaultActor = {
    id: Nullable<number>
    name: Nullable<string>
}

export type Actor = {
    firstName: string
    lastName: string
}

export type DefaultChar = {
    id: Nullable<number>
    name: Nullable<string>
    actor: Nullable<DefaultActor>
}

export type Char = {
    id: number
    name: string
    actor: DefaultActor
}

export type FullChar = {
    id: number
    firstName: string
    lastName: string
    actor: Nullable<Actor>
}

export type DefaultImg = {
    dimensions: {
        height: number
        width: number
    }
    path: Nullable<string>
    src: Nullable<string>
}

export type DefaultVideo = {
    id: Nullable<number>
    img: Nullable<string>
    releaseDate: Nullable<string>
    title: Nullable<string>
    year: Nullable<number>
}

export type Video = {
    id: number
    img: string
    releaseDate: string
    title: string
    year: number
}

export type InitialAppState = {
    auth: boolean
    hardMode: boolean
    inverted: boolean
    language: Language
    reveal: boolean
    units: Units
    user: User
    verify: boolean
}

export type InitialHomeState = {
    quiz: DefaultQuiz
    partTwo: Nullable<Quiz>
    answers: DefaultAnswer[]
    history: {
        answers: DefaultHistoryData
        quizzes: DefaultHistoryData
    }
}

export type InitialFormState = {
    action: DefaultAction
    actions: Action[]
    char: DefaultChar
    chars: FullChar[]
    file: Nullable<string>
    hint: string
    img: DefaultImg
    location: GeoData
    partTwo: Nullable<DefaultQuiz>
    quizzes: Quiz[]
    video: DefaultVideo
    videos: Video[]
}

export type InitialAdminState = {
    char: DefaultChar
    chars: FullChar[]
    file: Nullable<string>
    img: DefaultImg
    partTwo: Nullable<DefaultQuiz>
    quizzes: Quiz[]
    video: DefaultVideo
    videos: Video[]
}

export type ReduxState = {
    admin: InitialAdminState
    app: InitialAppState
    form: InitialFormState
    home: InitialHomeState
}
