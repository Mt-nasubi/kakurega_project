export const toJstDate = (ts: string | null) => {
    if (!ts) return "";
    const d = new Date(ts);
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(0, 10);
};

export const toJstTime = (ts: string | null) => {
    if (!ts) return "";
    const d = new Date(ts);
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(11, 16);
};
