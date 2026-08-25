export type Node = {
    id: string,
    label: string,

    x: number,
    y: number,
    
    vx: number,
    vy: number,
}

export type Edge = {
    id: string,
    from: string,
    to: string,
};