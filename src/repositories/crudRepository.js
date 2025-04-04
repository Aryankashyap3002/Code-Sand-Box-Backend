export default function crudRepository(model) {
    return {
        create: async function (data) {
            const newDoc = await model.create(data);
            return newDoc;
        },
        getAll: async function () {
            const allDocs = await model.find();
            return allDocs;
        },
        getById: async function (id) {
            const doc = await model.findById(id);
            return doc;
        },
        delete: async function (id) {
            const responsse = await model.findByIdAndDelete(id);
            return responsse;
        },
        update: async function (id) {
            const response = await model.findByIdAndUpdate(id);
            return response;
        },
        deleteMany: async function (modelsId) {
            const response = await model.deleteMany({
                _id: {
                    $in: modelsId
                }
               });
            return response;    
        }
    }
}