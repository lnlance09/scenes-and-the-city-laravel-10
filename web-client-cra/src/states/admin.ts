import { InitialAdminState } from "../interfaces"
import { defaultChar, defaultImg, defaultVideo } from "./form"

export const initialAdminState: InitialAdminState = {
    char: defaultChar,
    chars: [],
    file: null,
    img: defaultImg,
    partTwo: null,
    quizzes: [],
    video: defaultVideo,
    videos: []
}
