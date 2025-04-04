import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import userRepository from '../repositories/userRepository.js';
import { ENABLE_EMAIL_VERIFICATION } from '../config/serverConfig.js';
import { addEmailtoMailQueue } from '../producers/mailQueueProducers.js';
import { verifyEmailMail } from '../utils/common/mailObject.js';
import ClientError from '../utils/errors/clientErroe.js';
import { createJWT } from '../utils/common/authUtils.js';
import ValidationError from '../utils/errors/vaidationError.js';

export const signUpService = async (data) => {
    try {
        const newUser = await userRepository.signUpUser(data);
        if (ENABLE_EMAIL_VERIFICATION == 'true') {
            addEmailtoMailQueue({
               ...verifyEmailMail(newUser.verificationToken),
               to: newUser.email 
            });
        }
        return newUser;
    } catch (error) {
        console.log('User service error', error);
        if (error.name === 'ValidationError') {
            throw new ValidationError(
              {
                error: error.errors
              },
              error.message
            );
        }
        if (error.name === 'MongoServerError' && error.code === 11000) {
            throw new ValidationError(
              {
                error: ['A user with same email or username already exists']
              },
              'A user with same email or username already exists'
            );
        }
    }
};

export const verifyTokenService = async (token) => {
    try{
        const user = await userRepository.getByToken(token);
        if(!user) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Invalid token',
                statusCode: StatusCodes.BAD_REQUEST
            });
        }

        // check if the token has expired or not
        if (user.verificationTokenExpiry < Date.now()) {
            throw new ClientError({
            explanation: 'Invalid data sent from the client',
            message: 'Token has expired',
            statusCode: StatusCodes.BAD_REQUEST
            });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        return user;
    } catch (error) {
        console.log('User service error', error);
        throw error;
    }  
};

export const signInService = async (data) => {
    try {
        const user = await userRepository.getByEmail(data.email);
        if(!user) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'No registered user found with this email',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isMatch = bcrypt.compareSync(data.password, user.password);
        if(!isMatch) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Invalid password, please try again',
                statusCode: StatusCodes.BAD_REQUEST
            });
        }

        return {
            username: user.username,
            avatar: user.avatar,
            email: user.email,
            _id: user._id,
            token: createJWT({ id: user._id, email: user.email })
        };
    } catch (error) {
        console.log('User service error', error);
        throw error;
    }
};

