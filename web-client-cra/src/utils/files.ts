import { FileWithPath } from "react-dropzone/."

type Dimensions = {
    height: number
    width: number
}
type ImgData = {
    dimensions: Dimensions
    path: string
    src: string | Blob
}

export const onDrop = (
    files: FileWithPath[],
    setFile: (file: FileWithPath) => any,
    setImg: (img: ImgData) => any
) => {
    if (files.length !== 1) {
        return
    }
    const file = files[0]
    setFile(file)
    const reader = new FileReader()
    reader.onabort = () => console.error("file reading was aborted")
    reader.onerror = () => console.error("file reading has failed")
    reader.onload = () => {
        const img = document.createElement("img")
        img.src = typeof reader.result === "string" ? reader.result : ""
        img.onload = () => {
            if (file.path === undefined) {
                return
            }
            const { height, src, width } = img
            setImg({
                dimensions: { height, width },
                path: file.path,
                src
            })
        }
    }
    reader.readAsDataURL(file)
    // eslint-disable-next-line react-hooks/exhaustive-deps
}
