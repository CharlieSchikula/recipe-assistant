import bcrypt from 'bcryptjs';

const text = 'Password123';
const saltRounds = 10;

async function checkHashConsistency() {
  try {
    // Hash the text multiple times
    const hash1 = await bcrypt.hash(text, saltRounds);
    const hash2 = await bcrypt.hash(text, saltRounds);

    console.log(`Hash 1: ${hash1}`);
    console.log(`Hash 2: ${hash2}`);

    // Compare the hashes
    const isMatch1 = await bcrypt.compare(text, hash1);
    const isMatch2 = await bcrypt.compare(text, hash2);

    console.log(`Hash 1 matches: ${isMatch1}`);
    console.log(`Hash 2 matches: ${isMatch2}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkHashConsistency();