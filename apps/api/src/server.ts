import fastify from 'fastify'
import {serializerCompiler,validatorCompiler,ZodTypeProvider} from 'fastify-type-provider-zod'
import { ticketRoutes } from './routes/tickets.js';

const server = fastify({
    logger:true
}).withTypeProvider<ZodTypeProvider>();

server.setSerializerCompiler(serializerCompiler);
server.setValidatorCompiler(validatorCompiler)

server.register(ticketRoutes);

const start = async()=>{
    try{
        await server.listen({port:3000,host:'0.0.0.0'});
        console.log('server running at http://localhost:3000');
    }
    catch(e){
        server.log.error(e);
        process.exit(1);
    }

};

start();