import {Named} from "@/model/type";
import classNames from "classnames";

const fallbackSrc = "";
export type SearchEverywhereResultProps = Named & { type: "placeholder"|"icon"|"text"|"image", src?: string; }
export default function SearchEverywhereResult({ name, type, src }: SearchEverywhereResultProps) {

    return (
        <div className="flex w-2xl">
            <div className="flex flex-col items-center">
                {["placeholder", "image", "icon"].includes(type)
                    ? <>
                        <div className={classNames("avatar", { placeholder: type === "placeholder"})}>
                            <div className="bg-neutral text-neutral-content w-16 rounded-3xl">
                                {type === "placeholder" ? <span className="text-3xl">{name.charAt(0)}</span> : <></>}
                                {type === "image" ? <img src={src || fallbackSrc}  alt={name} /> : <></>}
                            </div>
                        </div>,
                        <div>
                            <p>content</p>
                        </div>
                    </> : <></>}
                {type === "text"
                    ? (
                        <div>
                            <h1>Result name</h1>

                            <p>content</p>
                        </div>
                    ) : <></>}
            </div>
            <div>
                <h2>Ingredient #1</h2>
                <h3>quick - details - here</h3>
                <p>super brief description here, eventually to be cutoff</p>
            </div>
        </div>
    )
}