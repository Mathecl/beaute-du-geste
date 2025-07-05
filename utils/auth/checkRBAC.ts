import jwt from 'jsonwebtoken';
import { getJwtSecretKey } from '@/utils/auth/auth';
import getCookieValue from '@/utils/auth/getCookieValue';

export default function checkRBAC() {
  const userToken = getCookieValue('user-token');
  const userTokenValue = userToken?.value;

  try {
    const secretKey = getJwtSecretKey();

    // Verify and decode the JWT token
    const payload = jwt.verify(userTokenValue, secretKey);

    // Log jwt payload
    const jwtPayload = payload;
    // console.log('Jwt paylaod:', jwtPayload);

    // // Access the userPrismaRole or other data from the payload
    // const userPrismaRole = payload.userPrismaRole;
    // console.log('User role from jwt paylaod:', userPrismaRole);

    // // You can use the role value in your logic here
    // if (userPrismaRole === 'admin') {
    //   console.log('User has the ' + userPrismaRole + ' role');
    // } else {
    //   console.log("User doesn't the admin role");
    // }

    return jwtPayload;
  } catch (error) {
    return 'Unauthorized:' + error;
  }
}
