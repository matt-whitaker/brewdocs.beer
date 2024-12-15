import sessionState, {useSession} from "@/state/session";
import Collapse from "@/component/collapse";

export default function ScheduleChill() {
    const session = useSession();
    return (
        <Collapse
            toggle={(open: boolean) => sessionState.set(`schedule.chill`, open)}
            key={"chill"}
            title={"3. Chill"}
            className="lg:collapse-open"
            openInitial={session[`schedule.chill`] ?? true}>
            <p>
                It is critical you chill your wort as quickly as possible. Cool you wort to 60°F to 72°F, depending on what your beer style calls for.
            </p>
        </Collapse>
    )
}