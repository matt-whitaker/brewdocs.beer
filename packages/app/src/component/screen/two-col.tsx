import Screen, {ScreenProps} from "@/component/screen";

export default function ScreenTwoCol({ children }: ScreenProps) {
    return <Screen className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">{children}</Screen>
}