// function to mock a database connection
const connect = async () => {
    try {
        // log successful connection message
        console.log('Connected to Mock Database.');
    } catch (error) {
        // log error message if connection fails and exit
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

export default { connect };
