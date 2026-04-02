export const up = (pgm) => {
    pgm.addColumn('users', {
        deleted_at: { type: 'timestamp', default: null }
    });
};

export const down = (pgm) => {
    pgm.dropColumn('users', 'deleted_at');
};
