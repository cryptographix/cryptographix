import 'mocha'

import { H2BA } from '@cryptographix/core';
import { BlockCipherEncoder } from '@cryptographix/cryptography';
import EncoderTester from '../encoder-tester'

/**
 * AES test vectors extracted from ircmaxell/quality-checker
 * @see  https://github.com/ircmaxell/quality-checker/blob/master/tmp/gh_18/PHP-PasswordLib-master/test/Data/Vectors/aes-ecb.test-vectors
 * @see  https://github.com/ircmaxell/quality-checker/blob/master/tmp/gh_18/PHP-PasswordLib-master/test/Data/Vectors/aes-cbc.test-vectors
 * @see  https://github.com/ircmaxell/quality-checker/blob/master/tmp/gh_18/PHP-PasswordLib-master/test/Data/Vectors/aes-ctr.test-vectors
 * @test {BlockCipherEncoder}
 */
describe('BlockCipherEncoder', () => EncoderTester.test(BlockCipherEncoder, [
  // DES-56
  // -ECB
  {
    name: "DES",
    settings: {
      algorithm: 'des',
      mode: 'ecb',
      key: H2BA('0101010101010101')
    },
    content: H2BA('8000000000000000'),
    expectedResult: H2BA('95F8A5E5DD31D900')
  },
  {
    name: "DES",
    settings: {
      algorithm: 'des',
      mode: 'ecb',
      key: H2BA('7CA110454A1A6E57')
    },
    content: H2BA('01A1D6D039776742'),
    expectedResult: H2BA('690F5B0D9A26939B')
  },

  // DES-112
  // -ECB
  {
    name: "DES2",
    settings: {
      algorithm: 'des2',
      mode: 'ecb',
      key: H2BA('000102030405060708090A0B0C0D0E0F')
    },
    content: H2BA('E4FC19D69463B783'),
    expectedResult: H2BA('0011223344556677')
  },
  {
    name: "DES2",
    settings: {
      algorithm: 'des2',
      mode: 'ecb',
      key: H2BA('2BD6459F82C5B300952C49104881FF48')
    },
    content: H2BA('8598538A8ECF117D'),
    expectedResult: H2BA('EA024714AD5C4D84')
  },

  // DES-168
  // -ECB
  {
    name: "DES3",
    settings: {
      algorithm: 'des3',
      mode: 'ecb',
      key: H2BA('000102030405060708090A0B0C0D0E0F1011121314151617')
    },
    content: H2BA('982662605553244D'),
    expectedResult: H2BA('0011223344556677')
  },
  {
    name: "DES3",
    settings: {
      algorithm: 'des3',
      mode: 'ecb',
      key: H2BA('2BD6459F82C5B300952C49104881FF482BD6459F82C5B300')
    },
    content: H2BA('8598538A8ECF117D'),
    expectedResult: H2BA('EA024714AD5C4D84')
  },

  // AES-128
  // -ECB
  {
    name: "AES-128",
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: H2BA('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('3ad77bb40d7a3660a89ecaf32466ef97')
  },
  {
    name: "AES-128",
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: H2BA('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: H2BA('ae2d8a571e03ac9c9eb76fac45af8e51'),
    expectedResult: H2BA('f5d3d58503b9699de785895a96fdbaaf')
  },
  {
    name: "AES-128",
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: H2BA('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: H2BA('30c81c46a35ce411e5fbc1191a0a52ef'),
    expectedResult: H2BA('43b1cd7f598ece23881b00e3ed030688')
  },
  {
    name: "AES-128",
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: H2BA('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: H2BA('f69f2445df4f9b17ad2b417be66c3710'),
    expectedResult: H2BA('7b0c785e27e8ad3f8223207104725dd4')
  },

  // -CBC
  {
    name: "AES-128-CBC",
    settings: {
      algorithm: 'aes-128',
      mode: 'cbc',
      key: H2BA('2b7e151628aed2a6abf7158809cf4f3c'),
      iv: H2BA('000102030405060708090A0B0C0D0E0F')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('7649abac8119b246cee98e9b12e9197d')
  },
  {
    name: "AES-128-CBC",
    settings: {
      algorithm: 'aes-128',
      mode: 'cbc',
      key: H2BA('2b7e151628aed2a6abf7158809cf4f3c'),
      iv: H2BA('000102030405060708090A0B0C0D0E0F'),
      padding: true
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('7649abac8119b246cee98e9b12e9197d8964e0b149c10b7b682e6e39aaeb731c')
  },

  // -CTR
  {
    name: "AES-128-CTR",
    settings: {
      algorithm: 'aes-128',
      mode: 'ctr',
      key: H2BA('2b7e151628aed2a6abf7158809cf4f3c'),
      iv: H2BA('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('874d6191b620e3261bef6864990db6ce')
  },

  // AES-192
  {
    name: "AES-192",
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: H2BA('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('bd334f1d6e45f25ff712a214571fa5cc')
  },
  {
    name: "AES-192",
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: H2BA('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: H2BA('ae2d8a571e03ac9c9eb76fac45af8e51'),
    expectedResult: H2BA('974104846d0ad3ad7734ecb3ecee4eef')
  },
  {
    name: "AES-192",
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: H2BA('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: H2BA('30c81c46a35ce411e5fbc1191a0a52ef'),
    expectedResult: H2BA('ef7afd2270e2e60adce0ba2face6444e')
  },
  {
    name: "AES-192",
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: H2BA('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: H2BA('f69f2445df4f9b17ad2b417be66c3710'),
    expectedResult: H2BA('9a4b41ba738d6c72fb16691603c18e0e')
  },

  // -CBC
  {
    name: "AES-192-CBC",
    settings: {
      algorithm: 'aes-192',
      mode: 'cbc',
      key: H2BA('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b'),
      iv: H2BA('000102030405060708090A0B0C0D0E0F')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('4f021db243bc633d7178183a9fa071e8')
  },
  {
    name: "AES-192-CBC",
    settings: {
      algorithm: 'aes-192',
      mode: 'cbc',
      key: H2BA('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b'),
      iv: H2BA('000102030405060708090A0B0C0D0E0F'),
      padding: true
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('4f021db243bc633d7178183a9fa071e8a647f1643b94812a175a13c8fa2014b2')
  },

  // -CTR
  {
    name: "AES-192-CTR",
    settings: {
      algorithm: 'aes-192',
      mode: 'ctr',
      key: H2BA('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b'),
      iv: H2BA('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('1abc932417521ca24f2b0459fe7e6e0b')
  },

  // AES-256
  // -ECB
  {
    name: "AES-256",
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: H2BA('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('f3eed1bdb5d2a03c064b5a7e3db181f8')
  },
  {
    name: "AES-256",
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: H2BA('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: H2BA('ae2d8a571e03ac9c9eb76fac45af8e51'),
    expectedResult: H2BA('591ccb10d410ed26dc5ba74a31362870')
  },
  {
    name: "AES-256",
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: H2BA('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: H2BA('30c81c46a35ce411e5fbc1191a0a52ef'),
    expectedResult: H2BA('b6ed21b99ca6f4f9f153e7b1beafed1d')
  },
  {
    name: "AES-256",
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: H2BA('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: H2BA('f69f2445df4f9b17ad2b417be66c3710'),
    expectedResult: H2BA('23304b7a39f9f3ff067d8d8f9e24ecc7')
  },

  // -CBC
  {
    name: "AES-256-CBC",
    settings: {
      algorithm: 'aes-256',
      mode: 'cbc',
      key: H2BA('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'),
      iv: H2BA('000102030405060708090A0B0C0D0E0F')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('f58c4c04d6e5f1ba779eabfb5f7bfbd6')
  },
  {
    name: "AES-256-CBC",
    settings: {
      algorithm: 'aes-256',
      mode: 'cbc',
      key: H2BA('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'),
      iv: H2BA('000102030405060708090A0B0C0D0E0F'),
      padding: true
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('f58c4c04d6e5f1ba779eabfb5f7bfbd6485a5c81519cf378fa36d42b8547edc0')
  },

  // -CTR
  {
    name: "AES-256-CTR",
    settings: {
      algorithm: 'aes-256',
      mode: 'ctr',
      key: H2BA('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'),
      iv: H2BA('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff')
    },
    content: H2BA('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: H2BA('601ec313775789a5b7a7f504bbf3d228')
  }

]))
