interface VideoFilterArray extends Array<string> {
    length: 4
    0: string
    1: string
    2: string
    3: string
}

type TranslationAuth = {
    email: string
    emailOrUsername: string
    password: string
    signIn: string
    newToThis: string
    signUp: string
    signOut: string
    forgotPassword: string
    resetPassword: string
    username: string
    regsiterBtn: string
    alreadyAccount: string
    enterYourEmail: string
    sendInstructions: string
    backToLogin: string
    emailSentToYou: string
    verificationCode: string
    verify: string
    verifyEmail: string
}

type TranslationAnswer = {
    hintOne: string
    hintTwo: string
    or: string
    placeholder: string
    reveal: string
    submit: string
    title: string
    myGuess: string
    actualAnswer: string
    points: string
    correct: string
    incorrect: string
    successMsg: string
}

type StepOne = {
    name: string
    description: string
    addPicture: string
    header: string
    selectAnother: string
    placeholderInfo: string
    placeholderCredit: string
    submitBtn: string
}

type StepTwo = {
    name: string
    description: string
    headerOne: string
    formOnePlaceholder: string
    headerTwo: string
    seeFullCast: string
    headerThree: string
    formThreePlaceholder: string
    noResults: string
    filters: string[]
    submitBtn: string
}

type StepThree = {
    name: string
    description: string
    buttonText: string
    locationHeader: string
    locationSubHeader: string
    hintHeader: string
    hintPlaceholder: string
    submitBtn: string
    successMsg: string
}

type TranslationTime = {
    hour: string
    minute: string
    second: string
}

type TranslationFooter = {
    about: string
    privacy: string
    rules: string
}

type TranslationHeader = {
    history: string
    leaderboard: string
    makeAQuiz: string
    settings: string
    stats: string
    language: string
}

type TranslationHistory = {
    answers: string
    quizzes: string
    emptyAnswersMsg: string
    emptyQuizzesMsg: string
    sceneFrom: string
}

type TranslationSettings = {
    darkMode: string
    hardMode: string
    revealAnswers: string
    units: string
}

type TranslationStats = {
    totalAnswers: string
    correctAnswers: string
    accuracy: string
    currentStreak: string
    marginOfError: string
}

type TranslationMain = {
    seeLastWeek: string
    seeToday: string
    weekendOf: string
    errorMessage: string
    seeStreetView: string
    toastErrorMessage: string
    and: string
    by: string
    inBetween: string
    expiredMsg: string
    finalAnswerHeader: string
    finalAnswerDeny: string
    finalAnswerConfirm: string
    estimatedLocation: string
    away: string
}

export type TranslationBlock = {
    auth: TranslationAuth
    answer: TranslationAnswer
    allDays: string[]
    days: string[]
    stepOne: StepOne
    stepTwo: StepTwo
    stepThree: StepThree
    time: TranslationTime
    footer: TranslationFooter
    header: TranslationHeader
    history: TranslationHistory
    settings: TranslationSettings
    stats: TranslationStats
    main: TranslationMain
    months: string[]
}
