export const createOne = (model) => async (req, res) => {
    try {
        const newModel = await model.create(...req.body);
        res.status(201).json({ user: newModel });
    }
    catch (err) {
        if (err instanceof Error)
            res.status(400).json({ message: err.message });
    }
};
