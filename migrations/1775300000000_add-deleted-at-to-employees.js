export const up = (pgm) => {
    pgm.addColumn('employees', {
        deleted_at: { type: 'timestamp', default: null }
    });
};

export const down = (pgm) => {
    pgm.dropColumn('employees', 'deleted_at');
};
