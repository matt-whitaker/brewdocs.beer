/**
 * Hands a file to the device's native share sheet where the browser offers one, and
 * downloads it directly where it does not. A share the brewer started and then
 * dismissed rejects with an `AbortError` and is never retried as a download — the
 * fallback is for a missing share sheet, not for a changed mind.
 */
export async function shareFile(file: File): Promise<void> {
    if (navigator.canShare?.({files: [file]})) {
        await navigator.share({files: [file]});
        return;
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
