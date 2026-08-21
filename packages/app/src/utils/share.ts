/**
 * Hands a file to the device's native share sheet where the browser offers one, and
 * downloads it directly where it does not — or where the sheet was offered and then
 * refused the file anyway.
 *
 * ⚠️ `canShare` returning true is NOT a promise that `share` will succeed, and it is
 * the only advance check the platform offers. Chrome on Android accepted the call for
 * an `application/json` file and rejected it immediately, no sheet ever shown (#1310),
 * which left a brewer with an error and no file on the one screen whose whole purpose
 * is recovery.
 *
 * A share the brewer started and then dismissed rejects with an `AbortError` and is
 * still never retried as a download — that is a changed mind, not a failed handoff,
 * and it is the one rejection this keeps terminal.
 */
export async function shareFile(file: File): Promise<void> {
    if (navigator.canShare?.({files: [file]})) {
        try {
            await navigator.share({files: [file]});
            return;
        } catch (cause) {
            if (cause instanceof Error && cause.name === "AbortError") throw cause;
        }
    }

    downloadFile(file);
}

function downloadFile(file: File): void {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 0);
}
